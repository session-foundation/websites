'use client';

import DynamicModuleCard from '@/app/mystakes/modules/DynamicModuleCard';
import type { AddressModuleProps } from '@/app/mystakes/modules/types';
import { useTotalStaked } from '@/app/mystakes/modules/useTotalStaked';
import type { QUERY_STATUS } from '@/lib/query';
import { useTranslations } from 'next-intl';

export default function StakedBalanceModule({
  addressOverride,
  size = 'lg',
  variant = 'hero',
}: AddressModuleProps) {
  const dict = useTranslations('modules.balance');
  const { totalStakedFormatted, status, refetch, enabled } = useTotalStaked(addressOverride);

  return (
    <DynamicModuleCard
      titleLong={dict('title')}
      status={status as QUERY_STATUS}
      refetch={refetch}
      enabled={enabled}
      size={size}
      variant={variant}
    >
      {totalStakedFormatted}
    </DynamicModuleCard>
  );
}
