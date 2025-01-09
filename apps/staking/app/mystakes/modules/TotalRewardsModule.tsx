'use client';

import { DYNAMIC_MODULE, URL } from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import { Module, ModuleTitle, ModuleTooltip } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';
import { useWallet } from '@session/wallet/hooks/useWallet';
import {
  getVariableFontSizeForSmallModule,
  ModuleDynamicContractReadText,
} from '@/components/ModuleDynamic';
import { useMemo } from 'react';
import { formatSENTBigInt } from '@session/contracts/hooks/SENT';
import { Address } from 'viem';
import { useGetRecipients } from '@session/contracts/hooks/ServiceNodeRewards';

export default function TotalRewardsModule(params?: { addressOverride?: Address }) {
  const dictionary = useTranslations('modules.totalRewards');
  const dictionaryShared = useTranslations('modules.shared');
  const toastDictionary = useTranslations('modules.toast');
  const titleFormat = useTranslations('modules.title');
  const title = dictionary('title');

  const { address: connectedAddress } = useWallet();
  const address = useMemo(
    () => params?.addressOverride ?? connectedAddress,
    [params?.addressOverride, connectedAddress]
  );

  const { claimed, status, refetch } = useGetRecipients({ address: address! });

  const formattedTotalRewardsAmount = formatSENTBigInt(
    claimed,
    DYNAMIC_MODULE.SENT_ROUNDED_DECIMALS
  );

  return (
    <Module>
      <ModuleTooltip>
        {dictionary.rich('description', { link: externalLink(URL.LEARN_MORE_TOTAL_REWARDS) })}
      </ModuleTooltip>
      <ModuleTitle>{titleFormat('format', { title })}</ModuleTitle>
      <ModuleDynamicContractReadText
        status={status}
        fallback={0}
        enabled={!!address}
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
          fontSize: getVariableFontSizeForSmallModule(formattedTotalRewardsAmount.length),
        }}
      >
        {formattedTotalRewardsAmount}
      </ModuleDynamicContractReadText>
    </Module>
  );
}
