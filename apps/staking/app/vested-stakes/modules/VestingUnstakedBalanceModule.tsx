'use client';

import { useVestingEndTime } from '@/app/vested-stakes/modules/VestingEndTimeModule';
import { ModuleDynamicQueryText } from '@/components/ModuleDynamic';
import type { QUERY_STATUS } from '@/lib/query';
import { useActiveVestingContractAddress } from '@/providers/vesting-provider';
import { addresses, isValidChainId } from '@session/contracts';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import { Module, ModuleTitle, ModuleTooltip } from '@session/ui/components/Module';
import { useERC20Balance } from '@session/wallet/hooks/useERC20Balance';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';

export function useVestingUnstakedBalance() {
  const { chainId } = useWallet();
  const address = useActiveVestingContractAddress();
  const { data, refetch, status } = useERC20Balance({
    tokenAddress: isValidChainId(chainId) ? addresses.Token[chainId] : undefined,
    chainId,
    targetAddress: address,
    query: { enabled: !!address },
  });

  const amount = data?.value ?? 0n;

  return {
    formattedAmount: formatSENTBigInt(amount),
    amount,
    status,
    refetch,
  };
}

export default function VestingUnstakedBalanceModule() {
  const dictUnstakedBalance = useTranslations('vesting.modules.unstakedBalance');
  const dictWithdrawable = useTranslations('vesting.modules.withdrawableBalance');
  const dictionaryShared = useTranslations('modules.shared');
  const toastDictionary = useTranslations('modules.toast');
  const titleFormat = useTranslations('modules.title');
  const { isEnded } = useVestingEndTime();
  const dict = isEnded ? dictWithdrawable : dictUnstakedBalance;
  const title = dict('title');

  const { formattedAmount, refetch, status } = useVestingUnstakedBalance();

  return (
    <Module>
      <ModuleTooltip>{dict('description')}</ModuleTooltip>
      <ModuleTitle>{titleFormat('format', { title })}</ModuleTitle>
      <ModuleDynamicQueryText
        status={status as QUERY_STATUS}
        enabled
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
      >
        {formattedAmount}
      </ModuleDynamicQueryText>
    </Module>
  );
}
