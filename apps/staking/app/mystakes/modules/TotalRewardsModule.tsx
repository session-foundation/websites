'use client';

import DynamicModuleCard from '@/app/mystakes/modules/DynamicModuleCard';
import type { AddressModuleProps } from '@/app/mystakes/modules/types';
import { useNetworkBalances } from '@/hooks/useNetworkBalances';
import { DYNAMIC_MODULE, URL } from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import type { QUERY_STATUS } from '@/lib/query';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export default function TotalRewardsModule({
  addressOverride,
  titleOverride,
  size,
  variant,
}: AddressModuleProps) {
  const dict = useTranslations('modules.totalRewards');

  const { address: connectedAddress } = useWallet();
  const address = useMemo(
    () => addressOverride ?? connectedAddress,
    [addressOverride, connectedAddress]
  );

  const { lifetimeRewards, refetch, status, enabled } = useNetworkBalances({
    addressOverride: address,
  });

  return (
    <DynamicModuleCard
      titleLong={titleOverride ?? dict('title')}
      titleShort={dict('titleShort')}
      tooltipContent={dict.rich('description', {
        link: externalLink(URL.LEARN_MORE_TOTAL_REWARDS),
      })}
      status={status as QUERY_STATUS}
      refetch={refetch}
      enabled={enabled}
      size={size}
      variant={variant}
    >
      {formatSENTBigInt(lifetimeRewards, DYNAMIC_MODULE.SENT_ROUNDED_DECIMALS)}
    </DynamicModuleCard>
  );
}
