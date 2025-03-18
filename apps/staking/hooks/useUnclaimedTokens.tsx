import { DYNAMIC_MODULE, HANDRAIL_THRESHOLD } from '@/lib/constants';
import { getRewardsInfo } from '@/lib/queries/getRewardsInfo';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { useGetRecipients } from '@session/contracts/hooks/ServiceNodeRewards';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import { bigIntMax } from '@session/util-crypto/maths';
import { safeTrySync } from '@session/util-js/try';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useMemo } from 'react';
import type { Address } from 'viem';

/**
 * Hook to get the unclaimed tokens for an ethereum address.
 *
 * @param params - The parameters for the hook.
 * @param params.addressOverride - The address to get the unclaimed tokens for. If not provided, the connected address will be used.
 */
export const useUnclaimedTokens = (params?: { addressOverride?: Address }) => {
  const { address: connectedAddress } = useWallet();
  const address = params?.addressOverride ?? connectedAddress;

  const enabled = !!address;

  const {
    data,
    status: statusUnclaimed,
    refetch: refetchUnclaimed,
  } = useStakingBackendQueryWithParams(
    getRewardsInfo,
    {
      address: address!,
    },
    { enabled }
  );

  const {
    claimed,
    refetch: refetchClaimed,
    status: statusClaimed,
  } = useGetRecipients({ address: address! });

  const unclaimedRewards = useMemo(() => {
    if (claimed === undefined || !data || !('rewards' in data) || data.rewards === undefined) {
      return undefined;
    }

    const [err, rewards] = safeTrySync(() => BigInt(data.rewards));
    if (err) return undefined;

    // Don't show negative rewards
    return bigIntMax(rewards - claimed, 0n);
  }, [data, claimed]);

  const formattedUnclaimedRewardsAmount = useMemo(
    () => formatSENTBigInt(unclaimedRewards, DYNAMIC_MODULE.SENT_ROUNDED_DECIMALS),
    [unclaimedRewards]
  );

  const status = useMemo(() => {
    if (statusUnclaimed === statusClaimed) {
      return statusUnclaimed;
    }

    if (statusUnclaimed === 'error') {
      return statusUnclaimed;
    }

    if (statusClaimed === 'error') {
      return statusClaimed;
    }

    return 'pending';
  }, [statusUnclaimed, statusClaimed]);

  const canClaim = Boolean(
    status === 'success' &&
      unclaimedRewards &&
      unclaimedRewards >= BigInt(HANDRAIL_THRESHOLD.CLAIM_REWARDS_AMOUNT)
  );

  const refetch = () => Promise.allSettled([refetchClaimed(), refetchUnclaimed()]);

  return {
    status,
    refetch,
    unclaimedRewards,
    formattedUnclaimedRewardsAmount,
    canClaim,
    enabled,
  };
};
