'use client';

import {
  getVariableFontSizeForSmallModule,
  ModuleDynamicContractReadText,
} from '@/components/ModuleDynamic';
import useDailyNodeReward from '@/hooks/useDailyNodeReward';
import { DYNAMIC_MODULE, URL } from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import { Module, ModuleTitle, ModuleTooltip } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { formatSENTBigInt } from '@session/contracts/hooks/SENT';
import { LinkDataTestId } from '@/testing/data-test-ids';

export default function DailyNodeReward() {
  const { dailyNodeReward, status, refetch } = useDailyNodeReward();
  const dictionary = useTranslations('modules.dailyRewards');
  const toastDictionary = useTranslations('modules.toast');
  const titleFormat = useTranslations('modules.title');

  const title = dictionary('title');

  const formattedDailyNodeRewardAmount = useMemo(
    () =>
      `~ ${formatSENTBigInt(dailyNodeReward ?? BigInt(0), DYNAMIC_MODULE.SENT_ROUNDED_DECIMALS)}`,
    [dailyNodeReward]
  );

  return (
    <Module>
      <ModuleTooltip>
        {dictionary.rich('description', {
          link: externalLink({
            href: URL.LEARN_MORE_DAILY_REWARDS,
            dataTestId: LinkDataTestId.Daily_Node_Reward_Tooltip,
          }),
        })}
      </ModuleTooltip>
      <ModuleTitle>{titleFormat('format', { title })}</ModuleTitle>
      <ModuleDynamicContractReadText
        status={status}
        fallback={0}
        errorToast={{
          messages: {
            error: toastDictionary('error', { module: title }),
            refetching: toastDictionary('refetching'),
            success: toastDictionary('refetchSuccess', { module: title }),
          },
          refetch,
        }}
        style={{
          fontSize: getVariableFontSizeForSmallModule(formattedDailyNodeRewardAmount.length),
        }}
      >
        {formattedDailyNodeRewardAmount}
      </ModuleDynamicContractReadText>
    </Module>
  );
}
