'use client';
import { NodeCardLastReward } from '@/components/StakedNode/Info/NodeCardLastReward';
import { NodeCardLastUptime } from '@/components/StakedNode/Info/NodeCardLastUptime';
import { NodeCardUnlockTimer } from '@/components/StakedNode/Info/NodeCardUnlockTimer';
import { NodeCardVersion } from '@/components/StakedNode/Info/NodeCardVersion';
import { StakeCardSnKey } from '@/components/StakedNode/Info/StakeCardSnKey';
import { StakeCardText } from '@/components/StakedNode/Info/StakeCardText';
import { StakeCardWalletAddress } from '@/components/StakedNode/Info/StakeCardWalletAddress';
import { StakeContributors } from '@/components/StakedNode/Info/StakeContributors';
import { NodeExitButton } from '@/components/StakedNode/NodeExitButton';
import { NodeExitButtonDialog } from '@/components/StakedNode/NodeExitButtonDialog';
import {
  NodeRequestExitButton,
  NodeRequestExitButtonWithDialog,
} from '@/components/StakedNode/NodeRequestExitButtonWithDialog';
import { NodeNotification } from '@/components/StakedNode/Notification/NodeNotification';
import { NodeVersionUpdateAvailableNotification } from '@/components/StakedNode/Notification/NodeVersionUpdateAvailableNotification';
import {
  type ComponentData,
  StakeCard,
  renderOrderedComponents,
} from '@/components/StakedNode/StakeCard';
import {
  STAKE_EVENT_STATE,
  STAKE_STATE,
  parseStakeEventState,
  parseStakeState,
} from '@/components/StakedNode/state';
import { WizardSectionDescription } from '@/components/Wizard';
import { getTotalStakedAmountForAddressFormatted } from '@/components/getTotalStakedAmountForAddressFormatted';
import { VERSION } from '@/hooks/useNetworkVersionInfo';
import useRelativeTime from '@/hooks/useRelativeTime';
import { BlockTimeManager, msInBlocks } from '@/lib/blocks';
import { SESSION_NODE, SESSION_NODE_TIME, SESSION_NODE_TIME_STATIC } from '@/lib/constants';
import {
  formatLocalizedTimeFromSeconds,
  formatPercentage,
  useFormatDate,
} from '@/lib/locale-client';
import { useUser } from '@/providers/user-provider';
import { NodeCardDataTestId } from '@/testing/data-test-ids';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import type { Stake, StakeContributor } from '@session/staking-api-js/schema';
import type { statusVariants } from '@session/ui/components/StatusIndicator';
import { KeyRoundIcon } from '@session/ui/icons/KeyRoundIcon';
import { SpannerAndScrewdriverIcon } from '@session/ui/icons/SpannerAndScrewdriverIcon';
import { cn } from '@session/ui/lib/utils';
import { Tooltip } from '@session/ui/ui/tooltip';
import type { EthereumAddress } from '@session/util-crypto/keys';
import { areEthereumAddressesEqual } from '@session/util-crypto/string';
import { getDateFromUnixTimestampSeconds } from '@session/util-js/date';
import { useWallet } from '@session/wallet/hooks/useWallet';
import type { VariantProps } from 'class-variance-authority';
import { useTranslations } from 'next-intl';
import { type HTMLAttributes, forwardRef, useMemo } from 'react';
import { CollapsableContent, ToggleCardExpansionButton } from './NodeCard';

/**
 * Checks if a given stake is ready to exit the smart contract.
 * @param state - The stake state.
 * @param eventState - The stake event state.
 * @param unlockHeight - The unlock height.
 * @param blockHeight - The current block height.
 */
export const isReadyToExitByUnlock = (
  state: STAKE_STATE,
  eventState: STAKE_EVENT_STATE,
  unlockHeight?: number,
  blockHeight?: number
) =>
  !!(
    state === STAKE_STATE.AWAITING_EXIT &&
    eventState !== STAKE_EVENT_STATE.EXITED &&
    unlockHeight &&
    blockHeight &&
    unlockHeight <= blockHeight
  );

const getVersionStringFromArray = (version: Array<number>) => {
  if (!version || !Array.isArray(version) || version.length > 3) {
    return undefined;
  }
  return version.join('.');
};

/**
 * Checks if a given stake is ready to exit the smart contract from a deregistration.
 * @param state - The stake state.
 * @param eventState - The stake event state.
 */
export const isReadyToExitByDeregistration = (state: STAKE_STATE, eventState: STAKE_EVENT_STATE) =>
  state === STAKE_STATE.DEREGISTERED && eventState !== STAKE_EVENT_STATE.EXITED;

function getNodeStatus(state: STAKE_STATE): VariantProps<typeof statusVariants>['status'] {
  switch (state) {
    case STAKE_STATE.RUNNING:
      return 'green';
    case STAKE_STATE.DECOMMISSIONED:
      return 'yellow';
    case STAKE_STATE.DEREGISTERED:
      return 'red';
    default:
      return 'grey';
  }
}

type NodeContributorIndicatorProps = HTMLAttributes<HTMLDivElement> & {
  isConnectedWallet?: boolean;
};

export const NodeOperatorIndicator = forwardRef<HTMLDivElement, NodeContributorIndicatorProps>(
  ({ className, isConnectedWallet, ...props }, ref) => {
    const dictionary = useTranslations('nodeCard.staked');
    return (
      <Tooltip
        tooltipContent={
          isConnectedWallet ? dictionary('operatorTooltip') : dictionary('operatorTooltipOther')
        }
      >
        <div
          ref={ref}
          className={cn(
            'flex flex-row items-center gap-1 align-middle font-normal text-session-green text-sm md:text-base',
            className
          )}
          {...props}
        >
          <SpannerAndScrewdriverIcon className="h-3.5 w-3.5 fill-session-green" />
        </div>
      </Tooltip>
    );
  }
);

export const ExitRequestorIndicator = forwardRef<HTMLDivElement, NodeContributorIndicatorProps>(
  ({ className, isConnectedWallet, ...props }, ref) => {
    const dictionary = useTranslations('nodeCard.staked');
    return (
      <Tooltip
        tooltipContent={
          isConnectedWallet
            ? dictionary('exitRequestorTooltip')
            : dictionary('exitRequestorTooltipOther')
        }
      >
        <div
          ref={ref}
          className={cn(
            'flex flex-row items-center gap-1 align-middle font-normal text-session-green text-sm md:text-base',
            className
          )}
          {...props}
        >
          <KeyRoundIcon className="h-3.5 w-3.5 stroke-warning" />
        </div>
      </Tooltip>
    );
  }
);

const useNodeDates = (node: Stake, currentBlock: number, networkTime: number) => {
  const { chainId } = useWallet();
  const {
    registration_height: registrationBlock,
    last_reward_block_height: lastRewardBlock,
    last_uptime_proof: lastUptimeProofSeconds,
    earned_downtime_blocks: earnedDowntimeBlocks,
    requested_unlock_height: requestedUnlockBlock,
    deregistration_height: deregistrationHeight,
    liquidation_height: liquidationBlock,
  } = node;

  return useMemo(() => {
    const blockTime = new BlockTimeManager(networkTime, currentBlock);
    const lastUptimeDate = lastUptimeProofSeconds
      ? getDateFromUnixTimestampSeconds(lastUptimeProofSeconds)
      : null;

    const deregistrationDate = earnedDowntimeBlocks
      ? blockTime.getDateOfBlock(currentBlock + earnedDowntimeBlocks)
      : null;

    const lastRewardDate = lastRewardBlock ? blockTime.getDateOfBlock(lastRewardBlock) : null;

    const requestedUnlockDate = requestedUnlockBlock
      ? blockTime.getDateOfBlock(requestedUnlockBlock)
      : null;

    const deregistrationUnlockBlock = deregistrationHeight
      ? deregistrationHeight +
        msInBlocks(SESSION_NODE_TIME(chainId).DEREGISTRATION_LOCKED_STAKE_SECONDS * 1000)
      : null;

    const deregistrationUnlockDate = deregistrationUnlockBlock
      ? blockTime.getDateOfBlock(deregistrationUnlockBlock)
      : null;

    const liquidationDate = liquidationBlock ? blockTime.getDateOfBlock(liquidationBlock) : null;

    const registrationDate = blockTime.getDateOfBlock(registrationBlock);
    const smallContributorRequestExitTime =
      registrationDate.getTime() +
      SESSION_NODE_TIME_STATIC.SMALL_CONTRIBUTOR_EXIT_REQUEST_WAIT_TIME_SECONDS * 1000;

    const smallContributorRequestExitDate =
      Date.now() < smallContributorRequestExitTime
        ? new Date(smallContributorRequestExitTime)
        : null;

    return {
      lastUptimeDate,
      deregistrationDate,
      lastRewardDate,
      requestedUnlockDate,
      deregistrationUnlockDate,
      liquidationDate,
      registrationDate,
      smallContributorRequestExitDate,
    };
  }, [
    currentBlock,
    networkTime,
    chainId,
    earnedDowntimeBlocks,
    lastUptimeProofSeconds,
    lastRewardBlock,
    requestedUnlockBlock,
    deregistrationHeight,
    liquidationBlock,
    registrationBlock,
  ]);
};

const StakedNodeCard = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    toggleId: string;
    stake: Stake;
    targetWalletAddress?: EthereumAddress;
    isDetailedView?: boolean;
    hideButton?: boolean;
  }
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO: see if it can be further componentised
>(({ stake, hideButton, isDetailedView = false, targetWalletAddress, ...props }, ref) => {
  const generalDictionary = useTranslations('general');
  const generalNodeDictionary = useTranslations('sessionNodes.general');
  const stakingNodeDictionary = useTranslations('sessionNodes.staking');
  const notFoundString = generalDictionary('notFound');

  const {
    service_node_pubkey: pubKey,
    contract_id: contractId,
    operator_fee: fee,
    operator_address: operatorAddress,
    contributors,
    last_reward_block_height: lastRewardBlock,
    last_uptime_proof: lastUptimeProofSeconds,
    service_node_version: versionArray,
    requested_unlock_height: requestedUnlockHeight,
  } = stake;

  const { connectedAddress } = useUser();

  const address = targetWalletAddress ?? connectedAddress;

  const {
    stakes: { networkTime, blockHeight },
    network,
    contractNodes,
  } = useUser();
  const isInContractIdList = useMemo(
    () => contractNodes.contractIdSet.has(contractId),
    [contractId, contractNodes.contractIdSet]
  );

  const { formattedStakedBalance, contributor, beneficiaryAddress, isOperator } = useMemo(() => {
    const contributor = address
      ? contributors.find((contributor) => areEthereumAddressesEqual(contributor.address, address))
      : null;

    const beneficiaryAddress =
      contributor && !areEthereumAddressesEqual(contributor.beneficiary, contributor.address)
        ? contributor.beneficiary
        : null;

    return {
      formattedStakedBalance: getTotalStakedAmountForAddressFormatted(contributors, address),
      contributor,
      beneficiaryAddress,
      isOperator: areEthereumAddressesEqual(operatorAddress, address),
    };
  }, [contributors, operatorAddress, address]);

  const availableUpdateStatus = useMemo(
    () => (versionArray ? network.checkForUpdate(versionArray) : null),
    [versionArray, network.checkForUpdate]
  );

  const version = useMemo(
    () => (versionArray ? getVersionStringFromArray(versionArray) : ''),
    [versionArray]
  );

  const sharedProps = {
    forceExpanded: isDetailedView,
    width: isDetailedView ? 'w-max' : 'w-full',
  } as const;

  const pubkeyOptions = {
    alwaysShowCopyButton: true,
    force: isDetailedView || hideButton ? 'collapse' : undefined,
  } as const;

  const {
    lastUptimeDate,
    deregistrationDate,
    lastRewardDate,
    requestedUnlockDate,
    deregistrationUnlockDate,
    liquidationDate,
    smallContributorRequestExitDate,
  } = useNodeDates(stake, blockHeight, networkTime);

  const state = useMemo(() => parseStakeState(stake, blockHeight), [stake, blockHeight]);

  const notificationComp = (
    <NodeNotification
      key="notification"
      node={stake}
      state={state}
      blockHeight={blockHeight}
      isInContractIdList={isInContractIdList}
      deregistrationDate={deregistrationDate}
      deregistrationUnlockDate={deregistrationUnlockDate}
      liquidationDate={liquidationDate}
      requestedUnlockDate={requestedUnlockDate}
      availableUpdate={availableUpdateStatus}
    />
  );

  const contributorsComp = (
    <StakeContributors
      key="contributors"
      stake={stake}
      userAddress={address}
      forceExpand={isDetailedView}
    />
  );

  const snKeyComp = (
    <StakeCardSnKey
      key="snKey"
      {...sharedProps}
      pubkey={pubKey}
      tooltipSide={isDetailedView ? 'top' : 'bottom'}
      isOperator={isOperator}
    />
  );

  const showUpdateAvailable =
    availableUpdateStatus === VERSION.MAJOR || availableUpdateStatus === VERSION.MINOR;

  const unlockTimerComp =
    requestedUnlockHeight && (state === STAKE_STATE.DECOMMISSIONED || showUpdateAvailable) ? (
      <NodeCardUnlockTimer key="unlockTimer" requestedUnlockDate={requestedUnlockDate} />
    ) : null;

  const updateSmallComp =
    showUpdateAvailable && state === STAKE_STATE.DECOMMISSIONED ? (
      <CollapsableContent forceExpanded size="xs">
        <NodeVersionUpdateAvailableNotification
          availableUpdate={availableUpdateStatus}
          className="md:text-xs"
        />
      </CollapsableContent>
    ) : null;

  const rewardTimerComp =
    state !== STAKE_STATE.RUNNING ? (
      <NodeCardLastReward
        key="rewardTimer"
        lastRewardDate={lastRewardDate}
        lastRewardBlock={lastRewardBlock}
      />
    ) : null;

  const uptimeTimerComp = lastUptimeProofSeconds ? (
    <NodeCardLastUptime
      key="uptimeTimer"
      {...sharedProps}
      size="xs"
      lastUptimeDate={lastUptimeDate}
      blockHeight={blockHeight}
      lastUptimeProofSeconds={lastUptimeProofSeconds}
    />
  ) : null;

  const versionComp =
    state === STAKE_STATE.RUNNING || state === STAKE_STATE.DECOMMISSIONED ? (
      <NodeCardVersion
        key="version"
        {...sharedProps}
        size="xs"
        version={version}
        availableUpdate={availableUpdateStatus}
      />
    ) : null;

  const operatorComp = !isOperator ? (
    <StakeCardWalletAddress
      key="operator"
      {...sharedProps}
      addressLabel="operatorAddress"
      size={'large'}
      address={operatorAddress}
      pubkeyOptions={pubkeyOptions}
    />
  ) : null;

  const beneficiaryComp = beneficiaryAddress ? (
    <StakeCardWalletAddress
      key="beneficiary"
      {...sharedProps}
      addressLabel="beneficiaryAddress"
      size={'large'}
      address={beneficiaryAddress}
      pubkeyOptions={pubkeyOptions}
    />
  ) : null;

  const stakeComp = (
    <StakeCardText
      key="stake"
      {...sharedProps}
      size={'large'}
      label={stakingNodeDictionary('stakedBalance')}
      content={formattedStakedBalance}
    />
  );

  const feeComp =
    contributors.length > 1 ? (
      <StakeCardText
        key="fee"
        {...sharedProps}
        size={'large'}
        label={generalNodeDictionary('operatorFee')}
        content={fee !== null ? formatPercentage(fee / 1_000_000) : notFoundString}
        hideCopyToClipboardButton
      />
    ) : null;

  const buttonComp = !hideButton ? (
    <StakeNodeCardButton
      key="actionButton"
      stake={stake}
      contributor={contributor}
      state={state}
      blockHeight={blockHeight}
      requestedUnlockDate={requestedUnlockDate}
      notFoundString={notFoundString}
      smallContributorRequestExitDate={smallContributorRequestExitDate}
      forceExpanded={isDetailedView}
    />
  ) : null;

  const expandButtonComp = (
    <ToggleCardExpansionButton key="expansionButton" htmlFor={props.toggleId} />
  );

  const componentData: Array<ComponentData> = [
    { id: 'notification', component: notificationComp },
    { id: 'contributors', component: contributorsComp },
    { id: 'snKey', component: snKeyComp },
    { id: 'unlockTimer', component: unlockTimerComp },
    { id: 'updateSmall', component: updateSmallComp },
    { id: 'rewardTimer', component: rewardTimerComp },
    { id: 'uptimeTimer', component: uptimeTimerComp },
    { id: 'version', component: versionComp },
    { id: 'operatorAddress', component: operatorComp },
    { id: 'beneficiaryAddress', component: beneficiaryComp },
    { id: 'stake', component: stakeComp },
    { id: 'fee', component: feeComp },
    { id: 'actionButton', component: buttonComp },
    { id: 'expandButton', component: expandButtonComp },
  ];

  const children = renderOrderedComponents(isDetailedView, componentData);

  return (
    <StakeCard
      ref={ref}
      {...props}
      data-testid={NodeCardDataTestId.Staked_Node}
      title={state}
      statusIndicatorColor={getNodeStatus(state)}
      isDetailedView={isDetailedView}
      className={cn(props.className, isDetailedView ? 'gap-x-2' : '')}
    >
      {children}
    </StakeCard>
  );
});

StakedNodeCard.displayName = 'StakedNodeCard';

function StakeNodeCardButton({
  stake,
  contributor,
  state,
  blockHeight,
  notFoundString,
  requestedUnlockDate,
  smallContributorRequestExitDate,
  forceExpanded,
}: {
  stake: Stake;
  contributor?: StakeContributor | null;
  state: STAKE_STATE;
  blockHeight: number;
  requestedUnlockDate?: Date | null;
  smallContributorRequestExitDate?: Date | null;
  notFoundString?: string;
  forceExpanded?: boolean;
}) {
  // TODO: move the resulting buttons into their own components and these time hooks into them
  const requestedUnlockTime = useRelativeTime(requestedUnlockDate, { addSuffix: true });
  const smallContributorRequestExitTime = useRelativeTime(smallContributorRequestExitDate, {
    addSuffix: true,
  });
  const dictionary = useTranslations('nodeCard.staked');
  const dictInfoNotice = useTranslations('infoNotice');
  const formattedReqUnlockDate = useFormatDate(requestedUnlockDate, {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const eventState = useMemo(() => parseStakeEventState(stake), [stake]);
  const stakeRequestingExit =
    state === STAKE_STATE.RUNNING && eventState === STAKE_EVENT_STATE.EXIT_REQUESTED;

  if (
    state === STAKE_STATE.EXITED ||
    eventState === STAKE_EVENT_STATE.EXITED ||
    state === STAKE_STATE.DECOMMISSIONED
  ) {
    return null;
  }

  if (
    isReadyToExitByUnlock(state, eventState, stake.requested_unlock_height, blockHeight) ||
    isReadyToExitByDeregistration(state, eventState)
  ) {
    return <NodeExitButtonDialog node={stake} forceExpanded />;
  }

  if (state === STAKE_STATE.RUNNING) {
    if (stakeRequestingExit) {
      return (
        <Tooltip
          tooltipContent={dictionary.rich('exit.disabledButtonTooltipContent', {
            relativeTime: requestedUnlockTime ?? notFoundString,
            date: formattedReqUnlockDate ?? notFoundString,
          })}
        >
          <NodeExitButton disabled forceExpanded={forceExpanded} />
        </Tooltip>
      );
    }

    const smallContributorAmount =
      stake.staking_requirement / BigInt(SESSION_NODE.SMALL_CONTRIBUTOR_DIVISOR);

    if (
      contributor &&
      contributor.amount < smallContributorAmount &&
      smallContributorRequestExitDate
    ) {
      return (
        <Tooltip
          tooltipContent={
            <WizardSectionDescription
              description={dictInfoNotice.rich('smallContributorExitTooSoon', {
                amount: formatSENTBigInt(smallContributorAmount, 0),
                relativeTime: smallContributorRequestExitTime,
                smallContributorLeaveRequestDelay: formatLocalizedTimeFromSeconds(
                  SESSION_NODE_TIME_STATIC.SMALL_CONTRIBUTOR_EXIT_REQUEST_WAIT_TIME_SECONDS
                ),
                linkOut: '',
              })}
              href="https://docs.getsession.org/contribute-to-the-session-network/frequently-asked-questions-faq#unlock-stake-while-operating"
            />
          }
        >
          <NodeRequestExitButton disabled forceExpanded={forceExpanded} />
        </Tooltip>
      );
    }

    return <NodeRequestExitButtonWithDialog node={stake} forceExpanded={forceExpanded} />;
  }
}

export { StakedNodeCard };
