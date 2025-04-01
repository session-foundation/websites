'use client';

import type { AddressModuleProps } from '@/app/mystakes/modules/types';
import { useTotalStaked } from '@/app/mystakes/modules/useTotalStaked';
import { ModuleDynamicQueryText } from '@/components/ModuleDynamic';
import type { QUERY_STATUS } from '@/lib/query';
import { useActiveVestingContractAddress } from '@/providers/vesting-provider';
import { Module, ModuleTitle, ModuleTooltip } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';

export default function VestingStakedBalanceModule({
  addressOverride,
  titleOverride,
}: AddressModuleProps) {
  const dictionary = useTranslations('vesting.modules.stakedBalance');
  const dictionaryShared = useTranslations('modules.shared');
  const toastDictionary = useTranslations('modules.toast');
  const titleFormat = useTranslations('modules.title');
  const title = titleOverride ?? dictionary('title');

  const vestingAddress = useActiveVestingContractAddress();
  const address = addressOverride ?? vestingAddress;
  const { totalStakedFormatted, status, refetch, enabled } = useTotalStaked(address);

  return (
    <Module>
      <ModuleTooltip>{dictionary('description')}</ModuleTooltip>
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
      >
        {totalStakedFormatted}
      </ModuleDynamicQueryText>
    </Module>
  );
}
