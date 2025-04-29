'use client';

import type { AddressModuleProps } from '@/app/mystakes/modules/types';
import { ModuleDynamicQueryText } from '@/components/ModuleDynamic';
import { useNetworkBalances } from '@/hooks/useNetworkBalances';
import { DYNAMIC_MODULE, URL } from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import type { QUERY_STATUS } from '@/lib/query';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import { Module, ModuleTitleDynamic, ModuleTooltip } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';

export default function UnclaimedStakesModule({
  addressOverride,
  titleOverride,
}: AddressModuleProps) {
  const dictionary = useTranslations('modules.unclaimedStakes');
  const dictionaryShared = useTranslations('modules.shared');
  const toastDictionary = useTranslations('modules.toast');
  const titleFormat = useTranslations('modules.title');
  const title = titleOverride ?? dictionary('title');

  const { claimableStakes, status, refetch } = useNetworkBalances({
    addressOverride,
  });

  const formattedAmount = formatSENTBigInt(claimableStakes, DYNAMIC_MODULE.SENT_ROUNDED_DECIMALS);

  return (
    <Module>
      <ModuleTooltip>
        {dictionary.rich('description', { link: externalLink(URL.LEARN_MORE_UNCLAIMED_REWARDS) })}
      </ModuleTooltip>
      <ModuleTitleDynamic longText={titleFormat('format', { title })} />
      <ModuleDynamicQueryText
        status={status as QUERY_STATUS}
        fallback={0}
        enabled
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
