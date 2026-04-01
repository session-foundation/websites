import { NodeContributorList, ToggleCardExpansionButton } from '@/components/NodeCard';
import { ContractSummary } from '@/components/StakedNode/ContractSummary';
import { StakeCardSnKey } from '@/components/StakedNode/Info/StakeCardSnKey';
import { StakeCardText } from '@/components/StakedNode/Info/StakeCardText';
import { StakeCardWalletAddress } from '@/components/StakedNode/Info/StakeCardWalletAddress';
import { NodeCardActionButton } from '@/components/StakedNode/NodeCardActionButton';
import {
  type ComponentData,
  StakeCard,
  renderOrderedComponents,
} from '@/components/StakedNode/StakeCard';
import { STAKE_CONTRACT_STATE, parseStakeContractState } from '@/components/StakedNode/state';
import { getTotalStakedAmountForAddressFormatted } from '@/components/getTotalStakedAmountForAddressFormatted';
import { SESSION_NODE_FULL_STAKE_AMOUNT } from '@/lib/constants';
import { formatPercentage } from '@/lib/locale-client';
import type { VolatileStorageNodeConfirming } from '@/lib/volatile-storage';
import { useUser } from '@/providers/user-provider';
import {
  ButtonDataTestId,
  NodeCardDataTestId,
  StakedNodeDataTestId,
} from '@/testing/data-test-ids';
import { CONTRIBUTION_CONTRACT_STATUS } from '@session/staking-api-js/enums';
import type {
  ContributionContract,
  ContributionContractNotReady,
} from '@session/staking-api-js/schema';
import type { statusVariants } from '@session/ui/components/StatusIndicator';
import { ETH_ZERO_ADDRESS } from '@session/util-crypto/constants';
import type { EthereumAddress } from '@session/util-crypto/keys';
import { areEthereumAddressesEqual } from '@session/util-crypto/string';
import type { VariantProps } from 'class-variance-authority';
import { useTranslations } from 'next-intl';
import { type HTMLAttributes, forwardRef, useMemo } from 'react';

function getContractStatusColor(
  state: STAKE_CONTRACT_STATE
): VariantProps<typeof statusVariants>['status'] {
  switch (state) {
    case STAKE_CONTRACT_STATE.AWAITING_OPERATOR_CONTRIBUTION:
    case STAKE_CONTRACT_STATE.AWAITING_OPERATOR_ACTIVATION:
      return 'yellow';
    case STAKE_CONTRACT_STATE.AWAITING_CONTRIBUTORS:
    case STAKE_CONTRACT_STATE.JOINING:
      return 'blue';
    default:
      return 'grey';
  }
}

const StakedContractCard = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    toggleId: string;
    contract: ContributionContract | ContributionContractNotReady;
    targetWalletAddress?: EthereumAddress;
    hideButton?: boolean;
    isDetailedView?: boolean;
    showAlreadyRunningWarning?: boolean;
  }
>(
  (
    {
      contract,
      hideButton,
      isDetailedView = false,
      targetWalletAddress,
      showAlreadyRunningWarning,
      ...props
    },
    ref
  ) => {
    const generalDictionary = useTranslations('general');
    const generalNodeDictionary = useTranslations('sessionNodes.general');
    const stakingNodeDictionary = useTranslations('sessionNodes.staking');
    const notFoundString = generalDictionary('notFound');

    const sharedProps = {
      forceExpanded: isDetailedView,
      width: isDetailedView ? 'w-max' : 'w-full',
    } as const;
    const { connectedAddress } = useUser();

    const address = targetWalletAddress ?? connectedAddress;

    const { fee, operator_address: operatorAddress, contributors } = contract;

    const { formattedStakedBalance, beneficiaryAddress, isOperator } = useMemo(() => {
      const contributor = address
        ? contributors.find((contributor) =>
            areEthereumAddressesEqual(contributor.address, address)
          )
        : null;

      const beneficiaryAddress =
        contributor &&
        !areEthereumAddressesEqual(contributor.beneficiary_address, contributor.address)
          ? contributor.beneficiary_address
          : null;

      return {
        formattedStakedBalance: getTotalStakedAmountForAddressFormatted(contributors, address),
        beneficiaryAddress,
        isOperator: areEthereumAddressesEqual(operatorAddress, address),
      };
    }, [contributors, operatorAddress, address]);

    const state = parseStakeContractState(contract);

    const notificationComp = (
      <ContractSummary
        key="notification"
        contract={contract}
        state={state}
        isOperator={isOperator}
        showAlreadyRunningWarning={showAlreadyRunningWarning}
      />
    );

    const contributorsComp = (
      <NodeContributorList
        key="contributors"
        contributors={contract.contributors}
        operatorAddress={contract.operator_address}
        userAddress={address}
        data-testid={StakedNodeDataTestId.Contributor_List}
        showEmptySlots
      />
    );

    const snKeyComp = (
      <StakeCardSnKey
        key="snKey"
        {...sharedProps}
        pubkey={contract.service_node_pubkey}
        tooltipSide={isDetailedView ? 'top' : 'bottom'}
        isOperator={isOperator}
      />
    );

    const operatorComp = (
      <StakeCardWalletAddress
        key="operator"
        {...sharedProps}
        addressLabel="operatorAddress"
        size={'large'}
        address={operatorAddress}
        pubkeyOptions={{
          alwaysShowCopyButton: true,
          force: isDetailedView || hideButton ? 'collapse' : undefined,
        }}
      />
    );

    const beneficiaryComp = beneficiaryAddress ? (
      <StakeCardWalletAddress
        key="beneficiary"
        {...sharedProps}
        addressLabel="beneficiaryAddress"
        size={'large'}
        address={beneficiaryAddress}
        pubkeyOptions={{
          alwaysShowCopyButton: true,
          force: isDetailedView || hideButton ? 'collapse' : undefined,
        }}
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

    const feeComp = (
      <StakeCardText
        key="fee"
        {...sharedProps}
        size={'large'}
        label={generalNodeDictionary('operatorFee')}
        content={fee !== null ? formatPercentage(fee / 10_000) : notFoundString}
        hideCopyToClipboardButton
      />
    );

    const buttonComp = !hideButton ? (
      <StakedContractCardButton
        key="actionButton"
        contract={contract}
        state={state}
        forceExpanded={showAlreadyRunningWarning}
      />
    ) : null;

    const expandButtonComp = (
      <ToggleCardExpansionButton key="expansionButton" htmlFor={props.toggleId} />
    );

    const componentData: Array<ComponentData> = [
      { id: 'notification', component: notificationComp },
      { id: 'contributors', component: contributorsComp },
      { id: 'snKey', component: snKeyComp },
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
        title={parseStakeContractState(contract)}
        statusIndicatorColor={getContractStatusColor(state)}
        operatorAddress={contract.operator_address}
      >
        {children}
      </StakeCard>
    );
  }
);
StakedContractCard.displayName = 'StakedContractCard';

function StakedContractCardButton({
  contract,
  state,
  forceExpanded,
}: {
  contract: ContributionContract | ContributionContractNotReady;
  state: STAKE_CONTRACT_STATE;
  forceExpanded?: boolean;
}) {
  const dictionaryOpenNode = useTranslations('nodeCard.open');

  if (state === STAKE_CONTRACT_STATE.JOINING) {
    return null;
  }

  return (
    <NodeCardActionButton
      href={`/stake/${contract.address}`}
      aria-label={dictionaryOpenNode('viewButton.ariaLabel')}
      data-testid={ButtonDataTestId.Node_Card_View}
      variant="outline"
      forceExpanded={forceExpanded}
    >
      {dictionaryOpenNode('viewButton.text')}
    </NodeCardActionButton>
  );
}

export const getStakedContractCardContractFromConfirmation = (
  node: VolatileStorageNodeConfirming
): ContributionContract | ContributionContractNotReady => {
  return {
    service_node_pubkey: node.pubkeyEd25519,
    pubkey_bls: node.pubkeyBls,
    operator_address: node.operatorAddress,
    fee: 0,
    manual_finalize: false,
    status: CONTRIBUTION_CONTRACT_STATUS.Finalized,
    address: ETH_ZERO_ADDRESS,
    contributors: [
      {
        address: node.operatorAddress,
        amount: SESSION_NODE_FULL_STAKE_AMOUNT,
        beneficiary_address: node.rewardsAddress,
        reserved: SESSION_NODE_FULL_STAKE_AMOUNT,
      },
    ],
    events: [],
  } satisfies ContributionContract;
};

export { StakedContractCard };
