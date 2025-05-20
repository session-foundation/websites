'use client';

import type { AddressModuleProps } from '@/app/mystakes/modules/types';
import { ModuleDynamicContractReadText } from '@/components/ModuleDynamic';
import { useDailyRewards } from '@/hooks/useDailyRewards';
import { DYNAMIC_MODULE } from '@/lib/constants';
import { formatDate } from '@/lib/locale-client';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import { Module, ModuleTitleDynamic, ModuleTooltip } from '@session/ui/components/Module';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

const formatDateTime = (unixSeconds: number) =>
  formatDate(new Date(unixSeconds * 1000), { dateStyle: 'medium', timeStyle: 'medium' });

export default function DailyRewardsModule(params?: AddressModuleProps) {
  const dictionary = useTranslations('modules.addressDailyRewards');
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

  const { dailyRewardAmount, dailyRewardTo, dailyRewardFrom, refetch, status, enabled } =
    useDailyRewards({
      addressOverride: address,
    });

  const formattedTotalRewardsAmount = formatSENTBigInt(
    dailyRewardAmount,
    DYNAMIC_MODULE.SENT_ROUNDED_DECIMALS
  );

  const formattedStartDate = useMemo(
    () => (dailyRewardFrom ? formatDateTime(dailyRewardFrom) : null),
    [dailyRewardFrom]
  );
  const formattedEndDate = useMemo(
    () => (dailyRewardTo ? formatDateTime(dailyRewardTo) : null),
    [dailyRewardTo]
  );

  return (
    <Module>
      <ModuleTooltip>
        {dictionary.rich('description', {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        })}
      </ModuleTooltip>
      <ModuleTitleDynamic
        longText={titleFormat('format', { title })}
        shortText={titleFormat('format', { title: titleShort })}
      />
      <ModuleDynamicContractReadText
        status={status}
        fallback={0}
        enabled={enabled}
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
