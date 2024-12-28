'use client';

import {
  getVariableFontSizeForLargeModule,
  ModuleDynamicQueryText,
} from '@/components/ModuleDynamic';
import { Module, ModuleTitle } from '@session/ui/components/Module';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import type { Address } from 'viem';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { getStakedNodes } from '@/lib/queries/getStakedNodes';
import type { QUERY_STATUS } from '@/lib/query';
import { getTotalStakedAmountForAddress } from '@/components/NodeCard';
import { formatSENTBigInt } from '@session/contracts/hooks/SENT';

function useTotalStakedAmount(params?: { addressOverride?: Address }) {
  const { address: connectedAddress } = useWallet();
  const address = params?.addressOverride ?? connectedAddress;

  const enabled = !!address;

  const { data, refetch, status } = useStakingBackendQueryWithParams(
    getStakedNodes,
    {
      address: address!,
    },
    { enabled }
  );

  const totalStakedAmount = useMemo(() => {
    if (!data) return [[], []];
    const stakesArray = 'stakes' in data && Array.isArray(data.stakes) ? data.stakes : [];
    const contractsArray =
      'contracts' in data && Array.isArray(data.contracts) ? data.contracts : [];

    const stakeBlsKeys = new Set(stakesArray.map(({ service_node_pubkey }) => service_node_pubkey));

    const filteredContracts = contractsArray.filter(
      ({ service_node_pubkey }) => !stakeBlsKeys.has(service_node_pubkey)
    );

    const totalStakedAmountContracts = address
      ? filteredContracts.reduce((acc, contract) => {
          const stakedBalance =
            getTotalStakedAmountForAddress(contract.contributors, address) ?? BigInt(0);
          return typeof stakedBalance !== 'bigint'
            ? acc + BigInt(stakedBalance)
            : acc + stakedBalance;
        }, BigInt(0))
      : 0n;

    const totalStakedAmountStakes = address
      ? stakesArray.reduce((acc, stake) => {
          const stakedBalance =
            getTotalStakedAmountForAddress(stake.contributors, address) ?? BigInt(0);
          return typeof stakedBalance !== 'bigint'
            ? acc + BigInt(stakedBalance)
            : acc + stakedBalance;
        }, BigInt(0))
      : 0n;

    return formatSENTBigInt(totalStakedAmountContracts + totalStakedAmountStakes);
  }, [data, address]);

  return { totalStakedAmount, status, refetch, enabled };
}

export default function BalanceModule({ addressOverride }: { addressOverride?: Address }) {
  const { totalStakedAmount, status, refetch, enabled } = useTotalStakedAmount({ addressOverride });
  const dictionary = useTranslations('modules.balance');
  const dictionaryShared = useTranslations('modules.shared');
  const toastDictionary = useTranslations('modules.toast');
  const titleFormat = useTranslations('modules.title');
  const title = dictionary('title');

  return (
    <Module size="lg" variant="hero">
      <ModuleTitle>{titleFormat('format', { title })}</ModuleTitle>
      <ModuleDynamicQueryText
        status={status as QUERY_STATUS}
        enabled={enabled}
        fallback={0}
        errorFallback={dictionaryShared('error')}
        errorToast={{
          messages: {
            error: toastDictionary('error', { module: title }),
            refetching: toastDictionary('refetching'),
            success: toastDictionary('refetchSuccess', { module: title }),
          },
          refetch,
        }}
        style={{
          fontSize: getVariableFontSizeForLargeModule(totalStakedAmount?.length ?? 6),
        }}
      >
        {totalStakedAmount}
      </ModuleDynamicQueryText>
    </Module>
  );
}
