'use client';

import { DYNAMIC_MODULE, URL } from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import { Module, ModuleTitleDynamic, ModuleTooltip } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { ModuleDynamicContractReadText } from '@/components/ModuleDynamic';
import { useMemo } from 'react';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import { useGetRecipients } from '@session/contracts/hooks/ServiceNodeRewards';
import type { AddressModuleProps } from '@/app/mystakes/modules/types';

export default function TotalRewardsModule(params?: AddressModuleProps) {
  const dictionary = useTranslations('modules.totalRewards');
  const dictionaryShared = useTranslations('modules.shared');
  const toastDictionary = useTranslations('modules.toast');
  const titleFormat = useTranslations('modules.title');
  const title = dictionary('title');
  const titleShort = dictionary('titleShort');

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
      <ModuleTitleDynamic
        longText={titleFormat('format', { title })}
        shortText={titleFormat('format', { title: titleShort })}
      />
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
      >
        {formattedTotalRewardsAmount}
      </ModuleDynamicContractReadText>
    </Module>
  );
}
