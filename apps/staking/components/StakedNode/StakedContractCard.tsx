import { ActionModuleDivider } from '@/components/ActionModule';
import { CollapsableContent, NodeContributorList, RowLabel } from '@/components/NodeCard';
import { ContractStartButton } from '@/components/StakedNode/ContractStartButton';
import { StakeCard } from '@/components/StakedNode/StakeCard';
import { STAKE_CONTRACT_STATE, parseStakeContractState } from '@/components/StakedNode/state';
import { getTotalStakedAmountForAddress } from '@/components/getTotalStakedAmountForAddress';
import { FEATURE_FLAG } from '@/lib/feature-flags';
import { useFeatureFlag } from '@/lib/feature-flags-client';
import { formatPercentage } from '@/lib/locale-client';
import {
  ButtonDataTestId,
  NodeCardDataTestId,
  StakedNodeDataTestId,
} from '@/testing/data-test-ids';
import { SENT_DECIMALS } from '@session/contracts';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import type {
  ContributionContract,
  ContributionContractNotReady,
} from '@session/staking-api-js/schema';
import { PubKey } from '@session/ui/components/PubKey';
import type { statusVariants } from '@session/ui/components/StatusIndicator';
import { cn } from '@session/ui/lib/utils';
import { Button } from '@session/ui/ui/button';
import { areHexesEqual } from '@session/util-crypto/string';
import { jsonBigIntReplacer } from '@session/util-js/bigint';
import { useWallet } from '@session/wallet/hooks/useWallet';
import type { VariantProps } from 'class-variance-authority';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { type HTMLAttributes, forwardRef, useMemo } from 'react';
import type { Address } from 'viem';

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

type ContractSummaryProps = {
  contract: ContributionContract | ContributionContractNotReady;
  state: STAKE_CONTRACT_STATE;
  isOperator?: boolean;
};

const ContractSummary = ({ contract, state, isOperator }: ContractSummaryProps) => {
  if (state === STAKE_CONTRACT_STATE.AWAITING_OPERATOR_ACTIVATION) {
    return (
      <>
        <NodeContributorList
          contributors={contract.contributors}
          data-testid={StakedNodeDataTestId.Contributor_List}
        />
        {isOperator ? <ContractStartButton contractAddress={contract.address} /> : null}
      </>
    );
  }

  return (
    <NodeContributorList
      contributors={contract.contributors}
      data-testid={StakedNodeDataTestId.Contributor_List}
    />
  );
};

const StakedContractCard = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    id: string;
    contract: ContributionContract | ContributionContractNotReady;
    targetWalletAddress?: Address;
    hideButton?: boolean;
  }
>(({ contract, hideButton, targetWalletAddress, ...props }, ref) => {
  const generalDictionary = useTranslations('general');
  const generalNodeDictionary = useTranslations('sessionNodes.general');
  const stakingNodeDictionary = useTranslations('sessionNodes.staking');
  const titleFormat = useTranslations('modules.title');
  const notFoundString = generalDictionary('notFound');

  const { address: connectedAddress } = useWallet();

  const address = targetWalletAddress ?? connectedAddress;

  const { fee, operator_address: operatorAddress, contributors } = contract;

  const formattedStakeBalance = formatSENTBigInt(
    address ? getTotalStakedAmountForAddress(contributors, address) : 0n,
    SENT_DECIMALS
  );
  const showRawNodeData = useFeatureFlag(FEATURE_FLAG.SHOW_NODE_RAW_DATA);

  const beneficiaryAddress = useMemo(() => {
    if (!address) return null;

    const contributor = contributors.find((contributor) =>
      areHexesEqual(contributor.address, address)
    );
    if (!contributor || !contributor.beneficiary_address) return null;

    return !areHexesEqual(contributor.beneficiary_address, contributor.address)
      ? contributor.beneficiary_address
      : null;
  }, [contributors, address]);

  const isSoloNode = contributors.length === 1;
  const isOperator = address ? areHexesEqual(contract.operator_address, address) : false;

  const state = parseStakeContractState(contract);

  return (
    <StakeCard
      ref={ref}
      {...props}
      data-testid={NodeCardDataTestId.Staked_Node}
      title={parseStakeContractState(contract)}
      statusIndicatorColor={getContractStatusColor(state)}
      publicKey={contract.service_node_pubkey}
      isOperator={isOperator}
      summary={<ContractSummary contract={contract} state={state} isOperator={isOperator} />}
      collapsableLastChildren={
        <>
          <CollapsableContent className="peer-checked:max-h-12 sm:gap-1 sm:peer-checked:max-h-5">
            <RowLabel>
              {titleFormat('format', { title: generalNodeDictionary('operatorAddress') })}
            </RowLabel>
            <PubKey
              pubKey={operatorAddress}
              expandOnHoverDesktopOnly
              force={hideButton ? 'collapse' : undefined}
            />
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
            {formattedStakeBalance}
          </CollapsableContent>
          {!isSoloNode ? (
            <CollapsableContent>
              <RowLabel>
                {titleFormat('format', { title: generalNodeDictionary('operatorFee') })}
              </RowLabel>
              {fee !== null ? formatPercentage(fee / 10_000) : notFoundString}
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
              {Object.entries(contract).map(([key, value]) => {
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
          {!hideButton ? <StakedContractCardButton contract={contract} state={state} /> : null}
        </>
      }
    />
  );
});
StakedContractCard.displayName = 'StakedContractCard';

function StakedContractCardButton({
  contract,
  state,
}: {
  contract: ContributionContract | ContributionContractNotReady;
  state: STAKE_CONTRACT_STATE;
}) {
  const dictionaryOpenNode = useTranslations('nodeCard.open');

  if (state === STAKE_CONTRACT_STATE.JOINING) {
    return null;
  }

  /** TODO: cleanup breakpoints */
  return (
    <CollapsableContent
      className="end-6 bottom-4 flex w-max items-end min-[500px]:absolute"
      size="buttonMd"
    >
      <Link href={`/stake/${contract.address}`}>
        <Button
          rounded="md"
          size="md"
          variant="outline"
          className="uppercase"
          aria-label={dictionaryOpenNode('viewButton.ariaLabel')}
          data-testid={ButtonDataTestId.Node_Card_View}
        >
          {dictionaryOpenNode('viewButton.text')}
        </Button>
      </Link>
    </CollapsableContent>
  );
}

export { StakedContractCard };
