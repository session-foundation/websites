'use client';

import { formatPercentage } from '@/lib/locale-client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { type ContributorContractInfo } from '@session/staking-api-js/client';
import { useTranslations } from 'next-intl';
import { forwardRef, type HTMLAttributes } from 'react';
import {
  InfoNodeCard,
  NodeItem,
  NodeItemLabel,
  NodeItemSeparator,
  NodeItemValue,
} from '@/components/InfoNodeCard';
import { formatSENTBigInt } from '@session/contracts/hooks/SENT';
import { usePathname } from 'next/navigation';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { areHexesEqual } from '@session/util-crypto/string';
import { AlertTooltip, Tooltip } from '@session/ui/ui/tooltip';
import { getContributionRangeFromContributors } from '@/lib/maths';
import { NodeOperatorIndicator } from '@/components/StakedNodeCard';
import { cn } from '@session/ui/lib/utils';
import { SessionTokenIcon } from '@session/ui/icons/SessionTokenIcon';
import { numberToBigInt } from '@session/util-crypto/maths';
import { parseStakeContractState, STAKE_CONTRACT_STATE } from '@/components/StakedNode/state';

export const StakedToIndicator = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    tokenAmount: number;
    hideTextOnMobile?: boolean;
  }
>(({ className, hideTextOnMobile, tokenAmount, ...props }, ref) => {
  const dictionary = useTranslations('nodeCard.open');

  return (
    <>
      <Tooltip
        tooltipContent={dictionary('stakedToTooltip', {
          tokenAmount: formatSENTBigInt(numberToBigInt(tokenAmount)),
        })}
      >
        <div
          ref={ref}
          className={cn(
            'text-session-green flex flex-row items-center gap-1 align-middle text-sm font-normal md:text-base',
            className
          )}
          {...props}
        >
          <SessionTokenIcon className="fill-session-green h-3.5 w-3.5" />
          {hideTextOnMobile ? (
            <span className="hidden md:block">{dictionary('stakedTo')}</span>
          ) : (
            dictionary('stakedTo')
          )}
        </div>
      </Tooltip>
    </>
  );
});

const OpenNodeCard = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { contract: ContributorContractInfo; forceSmall?: boolean }
>(({ className, forceSmall, contract, ...props }, ref) => {
  const dictionary = useTranslations('nodeCard.open');
  const generalNodeDictionary = useTranslations('sessionNodes.general');
  const titleFormat = useTranslations('modules.title');
  const pathname = usePathname();
  const { address } = useWallet();

  const { service_node_pubkey: pubKey, fee, contributors } = contract;

  const { minStake, maxStake } = getContributionRangeFromContributors(contributors);

  const isOperator = areHexesEqual(contract.operator_address, address);
  const isContributor = contributors.find((contributor) =>
    areHexesEqual(contributor.address, address)
  );

  const state = parseStakeContractState(contract);

  return (
    <InfoNodeCard
      ref={ref}
      className={className}
      pubKey={pubKey}
      statusIndicatorColour="blue"
      isActive={pathname === `/stake/${contract.address}`}
      forceSmall={forceSmall}
      button={{
        ariaLabel: dictionary('viewButton.ariaLabel'),
        text: dictionary('viewButton.text'),
        dataTestId: ButtonDataTestId.Node_Card_View,
        link: `/stake/${contract.address}`,
      }}
      {...props}
    >
      {isOperator ? (
        <NodeItem className="-ms-0.5 mb-0.5 flex flex-row items-center align-middle">
          {state === STAKE_CONTRACT_STATE.AWAITING_OPERATOR_CONTRIBUTION ? (
            <AlertTooltip tooltipContent={dictionary('youOperatorNotStaked')} />
          ) : (
            <>
              <NodeOperatorIndicator />
              <NodeItemSeparator className="ms-2 hidden md:block" />
            </>
          )}
        </NodeItem>
      ) : isContributor ? (
        <NodeItem className="-ms-0.5 mb-0.5 flex flex-row items-center align-middle">
          <StakedToIndicator hideTextOnMobile tokenAmount={isContributor.amount} />
          <NodeItemSeparator className="ms-2 hidden md:block" />
        </NodeItem>
      ) : null}
      <NodeItem>
        <NodeItemLabel className="inline-flex md:hidden">
          {titleFormat('format', { title: dictionary('min') })}
        </NodeItemLabel>
        <NodeItemLabel className="hidden md:inline-flex">
          {titleFormat('format', { title: dictionary('minContribution') })}
        </NodeItemLabel>
        <NodeItemValue>{formatSENTBigInt(minStake, 2)}</NodeItemValue>
      </NodeItem>
      <NodeItemSeparator className="hidden md:block" />
      <NodeItem className="hidden md:block">
        <NodeItemLabel>{titleFormat('format', { title: dictionary('max') })}</NodeItemLabel>
        <NodeItemValue>{formatSENTBigInt(maxStake, 2)}</NodeItemValue>
      </NodeItem>
      <NodeItemSeparator />
      <NodeItem>
        <NodeItemLabel>
          {titleFormat('format', { title: generalNodeDictionary('operatorFeeShort') })}
        </NodeItemLabel>
        <NodeItemValue>{formatPercentage(fee / 10000)}</NodeItemValue>
      </NodeItem>
    </InfoNodeCard>
  );
});
OpenNodeCard.displayName = 'OpenNodeCard';

export { OpenNodeCard };
