'use client';

import type { AddressModuleProps } from '@/app/mystakes/modules/types';
import { ModuleDynamicQueryText } from '@/components/ModuleDynamic';
import { useUnclaimedTokens } from '@/hooks/useUnclaimedTokens';
import { URL } from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import type { QUERY_STATUS } from '@/lib/query';
import { LinkDataTestId } from '@/testing/data-test-ids';
import { Module, ModuleTitleDynamic, ModuleTooltip } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';

export default function UnclaimedTokensModule({
  addressOverride,
  titleOverride,
}: AddressModuleProps) {
  const dictionary = useTranslations('modules.unclaimedRewards');
  const dictionaryShared = useTranslations('modules.shared');
  const toastDictionary = useTranslations('modules.toast');
  const titleFormat = useTranslations('modules.title');
  const title = titleOverride ?? dictionary('title');

  const { formattedUnclaimedRewardsAmount, status, refetch, enabled } = useUnclaimedTokens({
    addressOverride,
  });

  return (
    <Module>
      <ModuleTooltip>
        {dictionary.rich('description', {
          link: externalLink({
            href: URL.LEARN_MORE_UNCLAIMED_REWARDS,
            dataTestId: LinkDataTestId.Unclaimed_Tokens_Tooltip,
          }),
        })}
      </ModuleTooltip>
      <ModuleTitleDynamic longText={titleFormat('format', { title })} />
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
        {formattedUnclaimedRewardsAmount}
      </ModuleDynamicQueryText>
    </Module>
  );
}
