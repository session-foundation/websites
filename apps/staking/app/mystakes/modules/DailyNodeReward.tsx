'use client';
import DynamicModuleCard from '@/app/mystakes/modules/DynamicModuleCard';
import { WizardSectionDescription } from '@/components/Wizard';
import useDailyNodeReward from '@/hooks/useDailyNodeReward';
import { DYNAMIC_MODULE, URL } from '@/lib/constants';
import type { QUERY_STATUS } from '@/lib/query';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import type { ModuleProps } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';

export default function DailyNodeReward({ size, variant }: ModuleProps) {
  const { dailyNodeReward, status, refetch } = useDailyNodeReward();
  const dict = useTranslations('modules.networkDailyRewards');

  return (
    <DynamicModuleCard
      titleLong={dict('title')}
      titleShort={dict('titleShort')}
      tooltipContent={
        <WizardSectionDescription
          className="text-base md:text-base"
          description={dict.rich('description', {
            linkOut: '',
          })}
          href={URL.LEARN_MORE_DAILY_REWARDS}
        />
      }
      status={status as QUERY_STATUS}
      refetch={refetch}
      enabled={true}
      size={size}
      variant={variant}
    >
      {formatSENTBigInt(dailyNodeReward ?? 0n, DYNAMIC_MODULE.SENT_ROUNDED_DECIMALS)}
    </DynamicModuleCard>
  );
}
