'use client';

import { ActionModuleDivider } from '@/components/ActionModule';
import { NodeExitButton } from '@/components/StakedNode/NodeExitButton';
import { NodeExitButtonDialog } from '@/components/StakedNode/NodeExitButtonDialog';
import {
  NodeRequestExitButton,
  NodeRequestExitButtonWithDialog,
} from '@/components/StakedNode/NodeRequestExitButtonWithDialog';
import { ExitUnlockTimerNotification, NodeSummary } from '@/components/StakedNode/NodeSummary';
import { StakeCard } from '@/components/StakedNode/StakeCard';
import {
  STAKE_EVENT_STATE,
  STAKE_STATE,
  isStakeRequestingExit,
  parseStakeEventState,
  parseStakeState,
} from '@/components/StakedNode/state';
import { WizardSectionDescription } from '@/components/Wizard';
import { getTotalStakedAmountForAddressFormatted } from '@/components/getTotalStakedAmountForAddressFormatted';
import useRelativeTime from '@/hooks/useRelativeTime';
import { useStakes } from '@/hooks/useStakes';
import { SESSION_NODE, SESSION_NODE_TIME, SESSION_NODE_TIME_STATIC } from '@/lib/constants';
import { FEATURE_FLAG } from '@/lib/feature-flags';
import { useFeatureFlag } from '@/lib/feature-flags-client';
import {
  formatLocalizedTimeFromSeconds,
  formatNumber,
  formatPercentage,
  useFormatDate,
} from '@/lib/locale-client';
import { ButtonDataTestId, NodeCardDataTestId } from '@/testing/data-test-ids';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import type { StakeContributor } from '@session/staking-api-js/schema';
import type { Stake } from '@session/staking-api-js/schema';
import { CopyToClipboardButton } from '@session/ui/components/CopyToClipboardButton';
import { PubKey } from '@session/ui/components/PubKey';
import type { statusVariants } from '@session/ui/components/StatusIndicator';
import { SpannerAndScrewdriverIcon } from '@session/ui/icons/SpannerAndScrewdriverIcon';
import { cn } from '@session/ui/lib/utils';
import { Tooltip } from '@session/ui/ui/tooltip';
import { areHexesEqual } from '@session/util-crypto/string';
import { jsonBigIntReplacer } from '@session/util-js/bigint';
import { getDateFromUnixTimestampSeconds } from '@session/util-js/date';
import { useWallet } from '@session/wallet/hooks/useWallet';
import type { VariantProps } from 'class-variance-authority';
import { useTranslations } from 'next-intl';
import { type HTMLAttributes, forwardRef, useMemo } from 'react';
import type { Address } from 'viem';
import { CollapsableContent, RowLabel } from './NodeCard';

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

const blocksInMs = (blocks: number) => blocks * SESSION_NODE.MS_PER_BLOCK;
const msInBlocks = (ms: number) => Math.floor(ms / SESSION_NODE.MS_PER_BLOCK);

class BlockTimeManager {
  private readonly networkTime: number;
  private readonly currentBlock: number;

  constructor(networkTime: number, currentBlock: number) {
    this.networkTime = networkTime;
    this.currentBlock = currentBlock;
  }

  getDateOfBlock(targetBlock: number) {
    return new Date(this.networkTime * 1000 + blocksInMs(targetBlock - this.currentBlock));
  }
}

type NodeOperatorIndicatorProps = HTMLAttributes<HTMLDivElement> & {
  isOperatorConnectedWallet?: boolean;
};

export const NodeOperatorIndicator = forwardRef<HTMLDivElement, NodeOperatorIndicatorProps>(
  ({ className, isOperatorConnectedWallet, ...props }, ref) => {
    const dictionary = useTranslations('nodeCard.staked');
    return (
      <Tooltip
        tooltipContent={
          isOperatorConnectedWallet
            ? dictionary('operatorTooltip')
            : dictionary('operatorTooltipOther')
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

const useNodeDates = (node: Stake, currentBlock: number, networkTime: number) => {
  const { chainId } = useWallet();
  const blockTime = new BlockTimeManager(networkTime, currentBlock);
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
    chainId,
    blockTime,
    currentBlock,
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
    id: string;
    stake: Stake;
    targetWalletAddress?: Address;
    blockHeight: number;
    networkTime: number;
    hideButton?: boolean;
  }
>(({ stake, blockHeight, networkTime, hideButton, targetWalletAddress, ...props }, ref) => {
  const dictionary = useTranslations('nodeCard.staked');
  const generalDictionary = useTranslations('general');
  const generalNodeDictionary = useTranslations('sessionNodes.general');
  const stakingNodeDictionary = useTranslations('sessionNodes.staking');
  const titleFormat = useTranslations('modules.title');
  const notFoundString = generalDictionary('notFound');

  const { address: connectedAddress } = useWallet();

  const address = targetWalletAddress ?? connectedAddress;

  const { networkContractIds } = useStakes(address);
  const isInContractIdList = networkContractIds?.has(stake.contract_id);

  const {
    operator_fee: fee,
    operator_address: operatorAddress,
    contributors,
    last_reward_block_height: lastRewardBlock,
    last_uptime_proof: lastUptimeProofSeconds,
  } = stake;

  const formattedStakedBalance = getTotalStakedAmountForAddressFormatted(contributors, address);
  const showRawNodeData = useFeatureFlag(FEATURE_FLAG.SHOW_NODE_RAW_DATA);

  const contributor = useMemo(
    () => contributors.find((contributor) => areHexesEqual(contributor.address, address)),
    [contributors, address]
  );

  const beneficiaryAddress = useMemo(() => {
    if (!address || !contributor || !contributor.beneficiary) return null;

    return !areHexesEqual(contributor.beneficiary, contributor.address)
      ? contributor.beneficiary
      : null;
  }, [contributor, address]);

  const {
    lastUptimeDate,
    deregistrationDate,
    lastRewardDate,
    requestedUnlockDate,
    deregistrationUnlockDate,
    liquidationDate,
    smallContributorRequestExitDate,
  } = useNodeDates(stake, blockHeight, networkTime);

  const formattedLastRewardDate = useFormatDate(lastRewardDate, {
    dateStyle: 'full',
    timeStyle: 'short',
  });
  const formattedLastUptimeDate = useFormatDate(lastUptimeDate, {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const lastRewardTime = useRelativeTime(lastRewardDate, { addSuffix: true });
  const deregistrationTime = useRelativeTime(deregistrationDate, { addSuffix: true });
  const lastUptimeTime = useRelativeTime(lastUptimeDate, { addSuffix: true });
  const requestedUnlockTime = useRelativeTime(requestedUnlockDate, { addSuffix: true });
  const deregistrationUnlockTime = useRelativeTime(deregistrationUnlockDate, { addSuffix: true });
  const liquidationTime = useRelativeTime(liquidationDate, { addSuffix: true });
  const smallContributorRequestExitTime = useRelativeTime(smallContributorRequestExitDate, {
    addSuffix: true,
  });

  const isSoloNode = contributors.length === 1;

  const state = parseStakeState(stake, blockHeight);

  return (
    <StakeCard
      ref={ref}
      {...props}
      data-testid={NodeCardDataTestId.Staked_Node}
      title={state}
      statusIndicatorColor={getNodeStatus(state)}
      publicKey={stake.service_node_pubkey}
      isOperator={areHexesEqual(stake.operator_address, address)}
      summary={
        <NodeSummary
          node={stake}
          state={state}
          blockHeight={blockHeight}
          isInContractIdList={isInContractIdList}
          deregistrationDate={deregistrationDate}
          deregistrationTime={deregistrationTime}
          deregistrationUnlockDate={deregistrationUnlockDate}
          deregistrationUnlockTime={deregistrationUnlockTime}
          liquidationDate={liquidationDate}
          liquidationTime={liquidationTime}
          requestedUnlockTime={requestedUnlockTime}
          requestedUnlockDate={requestedUnlockDate}
        />
      }
      collapsableFirstChildren={
        <>
          {state === STAKE_STATE.DECOMMISSIONED && stake.requested_unlock_height ? (
            <CollapsableContent className="text-warning" size="xs">
              <ExitUnlockTimerNotification
                date={requestedUnlockDate}
                timeString={requestedUnlockTime}
                className="md:text-xs"
              />
            </CollapsableContent>
          ) : null}
          {state !== STAKE_STATE.RUNNING ? (
            <CollapsableContent size="xs">
              <Tooltip
                tooltipContent={dictionary('lastRewardDescription', {
                  blockNumber: lastRewardBlock ? formatNumber(lastRewardBlock) : notFoundString,
                  date: formattedLastRewardDate ?? notFoundString,
                })}
              >
                <span className="font-normal text-gray-lightest">
                  {dictionary('lastReward', {
                    relativeTime: lastRewardTime ?? notFoundString,
                  })}
                </span>
              </Tooltip>
            </CollapsableContent>
          ) : null}
          {lastUptimeProofSeconds ? (
            <CollapsableContent size="xs">
              <Tooltip
                tooltipContent={dictionary('lastUptimeDescription', {
                  blockNumber: lastUptimeProofSeconds
                    ? formatNumber(
                        blockHeight - msInBlocks(Date.now() - lastUptimeProofSeconds * 1000)
                      )
                    : notFoundString,
                  date: formattedLastUptimeDate ?? notFoundString,
                })}
              >
                <span className="font-normal text-gray-lightest">
                  {dictionary('lastUptime', { relativeTime: lastUptimeTime ?? notFoundString })}
                </span>
              </Tooltip>
            </CollapsableContent>
          ) : null}
        </>
      }
      collapsableLastChildren={
        <>
          <CollapsableContent className="peer-checked:max-h-12 sm:gap-1 sm:peer-checked:max-h-5">
            <RowLabel>
              {titleFormat('format', { title: generalNodeDictionary('operatorAddress') })}
            </RowLabel>
            <PubKey pubKey={operatorAddress} expandOnHoverDesktopOnly />
          </CollapsableContent>
          {beneficiaryAddress ? (
            <CollapsableContent className="peer-checked:max-h-12 sm:gap-1 sm:peer-checked:max-h-5">
              <RowLabel>
                {titleFormat('format', { title: generalNodeDictionary('beneficiaryAddress') })}
              </RowLabel>
              <PubKey pubKey={beneficiaryAddress} expandOnHoverDesktopOnly />
            </CollapsableContent>
          ) : null}
          <CollapsableContent>
            <RowLabel>
              {titleFormat('format', { title: stakingNodeDictionary('stakedBalance') })}
            </RowLabel>
            {formattedStakedBalance}
            <CopyToClipboardButton
              textToCopy={formattedStakedBalance}
              data-testid={ButtonDataTestId.Staked_Node_Copy_Staked_Balance}
            />
          </CollapsableContent>
          {!isSoloNode ? (
            <CollapsableContent>
              <RowLabel>
                {titleFormat('format', { title: generalNodeDictionary('operatorFee') })}
              </RowLabel>
              {fee !== null ? formatPercentage(fee / 1_000_000) : notFoundString}
            </CollapsableContent>
          ) : null}
          {showRawNodeData ? (
            <>
              <CollapsableContent className="hidden peer-checked:block">
                <RowLabel>
                  {titleFormat('format', { title: generalNodeDictionary('rawData') })}
                </RowLabel>
              </CollapsableContent>
              <CollapsableContent className="hidden peer-checked:block peer-checked:h-2" size="xs">
                <ActionModuleDivider className="h-0.5" />
              </CollapsableContent>
              {Object.entries(stake).map(([key, value]) => {
                const valueToDisplay = JSON.stringify(value, jsonBigIntReplacer);
                return (
                  <CollapsableContent
                    size="xs"
                    key={key}
                    className={cn(
                      'hidden peer-checked:block',
                      valueToDisplay.length > 100 ? 'peer-checked:max-h-8' : ''
                    )}
                  >
                    <RowLabel>{`${key}: `}</RowLabel>
                    <span>{valueToDisplay}</span>
                  </CollapsableContent>
                );
              })}
            </>
          ) : null}
          {!hideButton ? (
            <StakeNodeCardButton
              stake={stake}
              contributor={contributor}
              state={state}
              blockHeight={blockHeight}
              requestedUnlockDate={requestedUnlockDate}
              requestedUnlockTime={requestedUnlockTime}
              notFoundString={notFoundString}
              smallContributorRequestExitDate={smallContributorRequestExitDate}
              smallContributorRequestExitTime={smallContributorRequestExitTime}
            />
          ) : null}
        </>
      }
    />
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
  requestedUnlockTime,
  smallContributorRequestExitDate,
  smallContributorRequestExitTime,
}: {
  stake: Stake;
  contributor?: StakeContributor;
  state: STAKE_STATE;
  blockHeight: number;
  requestedUnlockDate?: Date | null;
  requestedUnlockTime?: string | null;
  smallContributorRequestExitDate?: Date | null;
  smallContributorRequestExitTime?: string | null;
  notFoundString?: string;
}) {
  const dictionary = useTranslations('nodeCard.staked');
  const dictInfoNotice = useTranslations('infoNotice');
  const formattedReqUnlockDate = useFormatDate(requestedUnlockDate, {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const eventState = parseStakeEventState(stake);

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
    return <NodeExitButtonDialog node={stake} />;
  }

  if (state === STAKE_STATE.RUNNING) {
    if (isStakeRequestingExit(stake)) {
      return (
        <Tooltip
          tooltipContent={dictionary.rich('exit.disabledButtonTooltipContent', {
            relativeTime: requestedUnlockTime ?? notFoundString,
            date: formattedReqUnlockDate ?? notFoundString,
          })}
        >
          <NodeExitButton disabled />
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
          <NodeRequestExitButton disabled />
        </Tooltip>
      );
    }

    return <NodeRequestExitButtonWithDialog node={stake} />;
  }
}

export { StakedNodeCard };
