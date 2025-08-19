import { BACKEND, PREFERENCE } from '@/lib/constants';
import logger from '@/lib/logger';
import { getStakedNodes } from '@/lib/queries/getStakedNodes';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { useDevicePref } from '@/providers/preferences-provider';
import { bigIntSortDesc } from '@session/util-crypto/maths';
import { safeTrySyncWithFallback } from '@session/util-js/try';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useMemo } from 'react';
import type { Address } from 'viem';

/**
 * Hook to get the vesting contracts for a wallet address.
 * @param overrideAddress - override address, this overrides the connected address
 * @param overrideRefetchIntervalMs - override refetch interval
 */
export function useVestingContracts(overrideAddress?: Address, overrideRefetchIntervalMs?: number) {
  const { address: connectedAddress } = useWallet();
  const address = overrideAddress ?? connectedAddress;
  const enabled = !!address;
  const autoRefresh = useDevicePref(PREFERENCE.DISABLE_BACKEND_AUTO_REFRESH);

  const { data, isLoading, isFetching, refetch, isError, status } =
    useStakingBackendQueryWithParams(
      getStakedNodes,
      {
        address: address!,
      },
      {
        enabled,
        refetchInterval: autoRefresh
          ? (overrideRefetchIntervalMs ?? BACKEND.NODE_TARGET_UPDATE_INTERVAL_SECONDS * 1000)
          : undefined,
      }
    );

  const contracts = useMemo(() => {
    const [vestingErr, vesting] = safeTrySyncWithFallback(() => data?.vesting ?? [], []);
    if (vestingErr) logger.error(vestingErr);

    return vesting.sort((a, b) => bigIntSortDesc(a.initial_amount, b.initial_amount));
  }, [data]);

  return {
    contracts,
    refetch,
    isLoading,
    isFetching,
    isError,
    status,
    enabled,
  };
}
