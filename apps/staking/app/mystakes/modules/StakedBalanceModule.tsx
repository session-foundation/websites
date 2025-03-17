'use client';

import { ModuleDynamicQueryText } from '@/components/ModuleDynamic';
import { Module, ModuleTitle } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';
import type { QUERY_STATUS } from '@/lib/query';
import type { Address } from 'viem';
import { useTotalStaked } from '@/app/mystakes/modules/useTotalStaked';

export default function StakedBalanceModule({ addressOverride }: { addressOverride?: Address }) {
  const { totalStakedFormatted, status, refetch, enabled } = useTotalStaked(addressOverride);
  const dictionary = useTranslations('modules.balance');
  const dictionaryShared = useTranslations('modules.shared');
  const toastDictionary = useTranslations('modules.toast');
  const titleFormat = useTranslations('modules.title');
  const title = dictionary('title');

  return (
    <Module size="lg" variant="hero">
      <ModuleTitle>{titleFormat('format', { title })}</ModuleTitle>
      <ModuleDynamicQueryText
        status={status as QUERY_STATUS}
        enabled={enabled}
        fallback={0}
        isLarge
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
        {totalStakedFormatted}
      </ModuleDynamicQueryText>
    </Module>
  );
}
