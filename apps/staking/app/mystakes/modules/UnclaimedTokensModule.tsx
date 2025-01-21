'use client';

import { URL } from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import { Module, ModuleTitle, ModuleTooltip } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';
import {
  getVariableFontSizeForSmallModule,
  ModuleDynamicQueryText,
} from '@/components/ModuleDynamic';
import { Address } from 'viem';
import type { QUERY_STATUS } from '@/lib/query';
import { useUnclaimedTokens } from '@/hooks/useUnclaimedTokens';

export default function UnclaimedTokensModule({ addressOverride }: { addressOverride?: Address }) {
  const dictionary = useTranslations('modules.unclaimedTokens');
  const dictionaryShared = useTranslations('modules.shared');
  const toastDictionary = useTranslations('modules.toast');
  const titleFormat = useTranslations('modules.title');
  const title = dictionary('title');

  const { formattedUnclaimedRewardsAmount, status, refetch, enabled } = useUnclaimedTokens({
    addressOverride,
  });

  return (
    <Module>
      <ModuleTooltip>
        {dictionary.rich('description', { link: externalLink(URL.LEARN_MORE_UNCLAIMED_REWARDS) })}
      </ModuleTooltip>
      <ModuleTitle>{titleFormat('format', { title })}</ModuleTitle>
      <ModuleDynamicQueryText
        status={status as QUERY_STATUS}
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
        style={{
          fontSize: getVariableFontSizeForSmallModule(formattedUnclaimedRewardsAmount.length),
        }}
      >
        {formattedUnclaimedRewardsAmount}
      </ModuleDynamicQueryText>
    </Module>
  );
}
