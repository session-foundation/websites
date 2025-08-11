'use client';

import DynamicModuleCard from '@/app/mystakes/modules/DynamicModuleCard';
import type { AddressModuleProps } from '@/app/mystakes/modules/types';
import { useNetworkBalances } from '@/hooks/useNetworkBalances';
import { DYNAMIC_MODULE, URL } from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import type { QUERY_STATUS } from '@/lib/query';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import { useTranslations } from 'next-intl';

export default function UnclaimedRewardsModule({
  addressOverride,
  titleOverride,
  size,
  variant,
}: AddressModuleProps) {
  const dict = useTranslations('modules.unclaimedRewards');

  const { claimableRewards, status, refetch, enabled } = useNetworkBalances({
    addressOverride,
  });

  return (
    <DynamicModuleCard
      titleLong={titleOverride ?? dict('title')}
      tooltipContent={dict.rich('description', {
        link: externalLink(URL.LEARN_MORE_UNCLAIMED_REWARDS),
      })}
      status={status as QUERY_STATUS}
      refetch={refetch}
      enabled={enabled}
      size={size}
      variant={variant}
    >
      {formatSENTBigInt(claimableRewards, DYNAMIC_MODULE.SENT_ROUNDED_DECIMALS)}
    </DynamicModuleCard>
  );
}
