import { BACKEND, PREFERENCE } from '@/lib/constants';
import { getDailyRewards } from '@/lib/queries/getDailyRewards';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import type { DailyRewardInfo } from '@session/staking-api-js/schema';
import { numberToBigInt } from '@session/util-crypto/maths';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useMemo } from 'react';
import { usePreferences } from 'usepref';
import type { Address } from 'viem';

export const useDailyRewards = (params?: { addressOverride?: Address }) => {
  const { address: connectedAddress } = useWallet();
  const { getItem } = usePreferences();
  const address = params?.addressOverride ?? connectedAddress;

  const autoRefresh = !!getItem<boolean>(PREFERENCE.AUTO_REFRESH_BACKEND);

  const enabled = !!address;

  const { data, status, refetch } = useStakingBackendQueryWithParams(
    getDailyRewards,
    {
      address: address!,
    },
    {
      enabled,
      refetchInterval: autoRefresh ? BACKEND.NODE_TARGET_UPDATE_INTERVAL_SECONDS * 1000 : undefined,
    }
  );

  const parsedData = useMemo(() => {
    let dailyRewardAmount = 0n;
    let dailyRewardFrom = 0;
    let dailyRewardTo = 0;
    let dataInRange: Array<DailyRewardInfo> = [];

    if (data && data.rewards.length > 1) {
      const cutoffTimestampSeconds = Math.trunc(Date.now() / 1000) - 24 * 60 * 60;
      dataInRange = data.rewards.filter(({ timestamp }) => timestamp >= cutoffTimestampSeconds);

      const dailyRewardStart = dataInRange[0];
      const dailyRewardEnd = dataInRange[dataInRange.length - 1];

      if (!dailyRewardStart || !dailyRewardEnd) {
        return;
      }

      dailyRewardFrom = dailyRewardStart.timestamp;
      dailyRewardTo = dailyRewardEnd.timestamp;
      dailyRewardAmount =
        numberToBigInt(dailyRewardEnd.lifetime_rewards) -
        numberToBigInt(dailyRewardStart.lifetime_rewards);
    }

    return {
      dailyRewardAmount,
      dailyRewardFrom,
      dailyRewardTo,
      dataInRange,
    };
  }, [data]);

  return {
    ...parsedData,
    refetch,
    status,
    enabled,
  };
};
