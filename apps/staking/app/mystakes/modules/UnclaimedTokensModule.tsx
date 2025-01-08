'use client';

import { DYNAMIC_MODULE, HANDRAIL_THRESHOLD, URL } from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import { Module, ModuleTitle, ModuleTooltip } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { useMemo } from 'react';
import type { QUERY_STATUS } from '@/lib/query';
import {
  getVariableFontSizeForSmallModule,
  ModuleDynamicQueryText,
} from '@/components/ModuleDynamic';
import { formatSENTBigInt } from '@session/contracts/hooks/SENT';
import { Address } from 'viem';
import { getRewardsInfo } from '@/lib/queries/getRewardsInfo';
import { useGetRecipients } from '@session/contracts/hooks/ServiceNodeRewards';
import { safeTrySync } from '@session/util-js/try';
import { bigIntMax } from '@session/util-crypto/maths';

export const useUnclaimedTokens = (params?: { addressOverride?: Address }) => {
  const { address: connectedAddress } = useWallet();
  const address = params?.addressOverride ?? connectedAddress;

  const enabled = !!address;

  const {
    data,
    status,
    refetch: refetchUnclaimed,
  } = useStakingBackendQueryWithParams(
    getRewardsInfo,
    {
      address: address!,
    },
    { enabled }
  );

  const { claimed, refetch: refetchClaimed } = useGetRecipients({ address: address! });

  const unclaimedRewards = useMemo(() => {
    if (claimed === undefined || !data || !('rewards' in data) || data.rewards === undefined) {
      return undefined;
    }

    const [err, rewards] = safeTrySync(() => BigInt(data.rewards));
    if (err) return undefined;

    return bigIntMax(rewards - claimed, 0n);
  }, [data, claimed]);

  const formattedUnclaimedRewardsAmount = useMemo(
    () => formatSENTBigInt(unclaimedRewards, DYNAMIC_MODULE.SENT_ROUNDED_DECIMALS),
    [unclaimedRewards]
  );

  const canClaim = Boolean(
    status === 'success' &&
      unclaimedRewards &&
      unclaimedRewards >= HANDRAIL_THRESHOLD.CLAIM_REWARDS_AMOUNT
  );

  return {
    status,
    refetchUnclaimed,
    refetchClaimed,
    unclaimedRewards,
    formattedUnclaimedRewardsAmount,
    canClaim,
    enabled,
  };
};

export default function UnclaimedTokensModule({ addressOverride }: { addressOverride?: Address }) {
  const dictionary = useTranslations('modules.unclaimedTokens');
  const dictionaryShared = useTranslations('modules.shared');
  const toastDictionary = useTranslations('modules.toast');
  const titleFormat = useTranslations('modules.title');
  const title = dictionary('title');

  const { formattedUnclaimedRewardsAmount, status, refetchClaimed, refetchUnclaimed, enabled } =
    useUnclaimedTokens({
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
          refetch: async () => {
            void refetchClaimed();
            return refetchUnclaimed();
          },
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
