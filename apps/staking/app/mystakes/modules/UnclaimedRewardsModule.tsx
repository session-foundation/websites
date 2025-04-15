'use client';

import TestnetPointsModule from '@/app/mystakes/modules/TestnetPointsModule';
import type { AddressModuleProps } from '@/app/mystakes/modules/types';
import { ModuleDynamicQueryText } from '@/components/ModuleDynamic';
import { useNetworkBalances } from '@/hooks/useNetworkBalances';
import { DYNAMIC_MODULE, PREFERENCE, URL } from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import type { QUERY_STATUS } from '@/lib/query';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import { Module, ModuleTitleDynamic, ModuleTooltip } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';
import { usePreferences } from 'usepref';

export default function UnclaimedRewardsModule({
  addressOverride,
  titleOverride,
}: AddressModuleProps) {
  const dictionary = useTranslations('modules.unclaimedRewards');
  const dictionaryShared = useTranslations('modules.shared');
  const toastDictionary = useTranslations('modules.toast');
  const titleFormat = useTranslations('modules.title');
  const title = titleOverride ?? dictionary('title');

  const { claimableRewards, status, refetch } = useNetworkBalances({
    addressOverride,
  });

  const { getItem } = usePreferences();
  const v2Rewards = !!getItem<boolean>(PREFERENCE.V2_Rewards);
  if (!v2Rewards) {
    return <TestnetPointsModule />;
  }

  const formattedAmount = formatSENTBigInt(claimableRewards, DYNAMIC_MODULE.SENT_ROUNDED_DECIMALS);

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
