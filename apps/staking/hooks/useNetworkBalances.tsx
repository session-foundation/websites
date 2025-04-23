import { BACKEND, HANDRAIL_THRESHOLD, PREFERENCE } from '@/lib/constants';
import { getRewardsInfo } from '@/lib/queries/getRewardsInfo';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { rewardsInfoSchema } from '@session/staking-api-js/schema';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useMemo } from 'react';
import { usePreferences } from 'usepref';
import type { Address } from 'viem';

export const useNetworkBalances = (params?: { addressOverride?: Address }) => {
  const { address: connectedAddress } = useWallet();
  const { getItem } = usePreferences();
  const address = params?.addressOverride ?? connectedAddress;

  const v2Rewards = !!getItem<boolean>(PREFERENCE.V2_Rewards);

  const enabled = !!address && v2Rewards;
  const autoRefresh = !!getItem<boolean>(PREFERENCE.AUTO_REFRESH_BACKEND);

  const { data, status, refetch } = useStakingBackendQueryWithParams(
    getRewardsInfo,
    {
      address: address!,
    },
    {
      enabled,
      refetchInterval: autoRefresh ? BACKEND.NODE_TARGET_UPDATE_INTERVAL_SECONDS * 1000 : undefined,
    }
  );

  const parsedData = useMemo(() => {
    let lifetimeLiquidated = 0n;
    let lifetimeStaked = 0n;
    let lifetimeRewards = 0n;
    let lifetimeUnlockedStakes = 0n;
    let lockedStakes = 0n;
    let timeLockedStakes = 0n;

    let claimableStakes = 0n;
    let claimableRewards = 0n;

    // TODO: remove the safeParse once we make v2 rewards the default
    const hasNetworkBalances = !!(data && rewardsInfoSchema.safeParse(data.rewards).success);

    if (hasNetworkBalances) {
      const rewards = rewardsInfoSchema.parse(data.rewards);
      lifetimeLiquidated = rewards.lifetime_liquidated_stakes;
      lifetimeStaked = rewards.lifetime_locked_stakes;
      lifetimeRewards = rewards.lifetime_rewards;
      lifetimeUnlockedStakes = rewards.lifetime_unlocked_stakes;
      lockedStakes = rewards.locked_stakes;
      timeLockedStakes = rewards.timelocked_stakes;

      claimableStakes = lifetimeUnlockedStakes - lifetimeLiquidated - rewards.claimed_stakes;
      claimableRewards = lifetimeRewards - rewards.claimed_rewards;
    }

    const unclaimed = claimableRewards + claimableStakes;

    return {
      unclaimed,
      lifetimeRewards,
      lifetimeStaked,
      timeLockedStakes,
      lockedStakes,
      claimableRewards,
      claimableStakes,
    };
  }, [data]);

  const canClaim =
    status === 'success' && parsedData.unclaimed >= BigInt(HANDRAIL_THRESHOLD.CLAIM_REWARDS_AMOUNT);

  return {
    ...parsedData,
    canClaim,
    refetch,
    status,
  };
};
