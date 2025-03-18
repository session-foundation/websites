'use client';

import {
  getContributedContributor,
  getContributionRangeForWallet,
  getReservedContributorNonContributed,
} from '@/app/stake/[address]/StakeInfo';
import {
  InfoNodeCard,
  NodeItem,
  NodeItemLabel,
  NodeItemSeparator,
  NodeItemValue,
} from '@/components/InfoNodeCard';
import { STAKE_CONTRACT_STATE, parseStakeContractState } from '@/components/StakedNode/state';
import { NodeOperatorIndicator } from '@/components/StakedNodeCard';
import { formatPercentage } from '@/lib/locale-client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { formatSENTBigInt, formatSENTNumber } from '@session/contracts/hooks/Token';
import type { ContributorContractInfo } from '@session/staking-api-js/client';
import { ContactIcon } from '@session/ui/icons/ContactIcon';
import { SessionTokenIcon } from '@session/ui/icons/SessionTokenIcon';
import { cn } from '@session/ui/lib/utils';
import { AlertTooltip, Tooltip } from '@session/ui/ui/tooltip';
import { numberToBigInt } from '@session/util-crypto/maths';
import { areHexesEqual } from '@session/util-crypto/string';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { type HTMLAttributes, forwardRef } from 'react';

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
            'flex flex-row items-center gap-1 align-middle font-normal text-session-green text-sm md:text-base',
            className
          )}
          {...props}
        >
          <SessionTokenIcon className="h-3.5 w-3.5 fill-session-green" />
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
  HTMLAttributes<HTMLDivElement> & {
    contract: ContributorContractInfo;
    forceSmall?: boolean;
    showAlreadyRunningWarning?: boolean;
  }
>(({ className, forceSmall, showAlreadyRunningWarning, contract, ...props }, ref) => {
  const dictionary = useTranslations('nodeCard.open');
  const generalNodeDictionary = useTranslations('sessionNodes.general');
  const titleFormat = useTranslations('modules.title');
  const pathname = usePathname();
  const { address } = useWallet();

  const { service_node_pubkey: pubKey, fee } = contract;

  const isOperator = areHexesEqual(contract.operator_address, address);
  const contributor = getContributedContributor(contract, address);
  const reservedContributor = getReservedContributorNonContributed(contract, address);

  const { minStake, maxStake } = getContributionRangeForWallet(contract, address);

  const connectedWalletNonContributedReservedStakeAmount =
    (!contributor && reservedContributor?.reserved) || 0;

  const state = parseStakeContractState(contract);

  const isActive = pathname === `/stake/${contract.address}`;

  return (
    <InfoNodeCard
      ref={ref}
      className={className}
      pubKey={pubKey}
      statusIndicatorColour={
        state === STAKE_CONTRACT_STATE.AWAITING_OPERATOR_CONTRIBUTION || showAlreadyRunningWarning
          ? 'yellow'
          : connectedWalletNonContributedReservedStakeAmount
            ? 'green'
            : 'blue'
      }
      isActive={pathname === `/stake/${contract.address}`}
      forceSmall={forceSmall}
      button={
        !isActive
          ? {
              ariaLabel: dictionary('viewButton.ariaLabel'),
              text: dictionary('viewButton.text'),
              dataTestId: ButtonDataTestId.Node_Card_View,
              link: `/stake/${contract.address}`,
            }
          : undefined
      }
      warnings={
        <>
          {showAlreadyRunningWarning ? (
            <AlertTooltip
              iconClassName="h-4 w-4 md:h-10 md:w-10"
              tooltipContent={dictionary('errorStakedButAlreadyRunning')}
            />
          ) : null}
          {state === STAKE_CONTRACT_STATE.AWAITING_OPERATOR_CONTRIBUTION ? (
            <AlertTooltip
              iconClassName="h-10 w-10"
              tooltipContent={dictionary('youOperatorNotStaked')}
            />
          ) : null}
          {connectedWalletNonContributedReservedStakeAmount ? (
            <Tooltip
              tooltipContent={dictionary('youReservedNotContributed', {
                tokenAmount: formatSENTNumber(connectedWalletNonContributedReservedStakeAmount),
              })}
            >
              <ContactIcon className="h-10 w-10 stroke-session-green" />
            </Tooltip>
          ) : null}
        </>
      }
      {...props}
    >
      {isOperator ? (
        <NodeItem className="-ms-0.5 mb-0.5 flex flex-row items-center gap-1.5 align-middle">
          <NodeOperatorIndicator />
        </NodeItem>
      ) : contributor ? (
        <NodeItem className="-ms-0.5 mb-0.5 flex flex-row items-center align-middle">
          <StakedToIndicator hideTextOnMobile tokenAmount={contributor.amount} />
          <NodeItemSeparator className="ms-2 hidden md:block" />
        </NodeItem>
      ) : null}
      <NodeItem className="sm:flex-nowrap sm:text-nowrap">
        <NodeItemLabel className="inline-flex sm:flex-nowrap sm:text-nowrap lg:hidden">
          {titleFormat('format', { title: dictionary('min') })}
        </NodeItemLabel>
        <NodeItemLabel className="hidden sm:flex-nowrap sm:text-nowrap lg:inline-flex">
          {titleFormat('format', { title: dictionary('minContribution') })}
        </NodeItemLabel>
        <NodeItemValue>
          {formatSENTBigInt(
            reservedContributor?.reserved ? numberToBigInt(reservedContributor.reserved) : minStake,
            2
          )}
        </NodeItemValue>
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
