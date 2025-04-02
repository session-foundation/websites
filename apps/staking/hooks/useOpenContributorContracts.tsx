import { getReadyContracts } from '@/hooks/parseContracts';
import { parseOpenContracts } from '@/hooks/parseOpenContracts';
import { useAddedBlsKeysPublic } from '@/hooks/useAddedBlsKeysPublic';
import { useStakes } from '@/hooks/useStakes';
import { BACKEND, PREFERENCE } from '@/lib/constants';
import logger from '@/lib/logger';
import { getContributionContracts } from '@/lib/queries/getContributionContracts';
import { useStakingBackendSuspenseQuery } from '@/lib/staking-api-client';
import { safeTrySyncWithFallback } from '@session/util-js/try';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useMemo } from 'react';
import { usePreferences } from 'usepref';
import type { Address } from 'viem';

/**
 * Hook to get the current open contributor contracts.
 * @param overrideAddress - The address to override the connected address.
 * @returns The open contributor contracts.
 */
export function useOpenContributorContracts(overrideAddress?: Address) {
  const { getItem } = usePreferences();
  const autoRefresh = !!getItem<boolean>(PREFERENCE.AUTO_REFRESH_BACKEND);
  const { address: connectedAddress } = useWallet();
  const address = overrideAddress ?? connectedAddress;

  const refetchInterval = autoRefresh
    ? BACKEND.L2_BACKGROUND_UPDATE_INTERVAL_SECONDS * 1000
    : undefined;

  const {
    data,
    isLoading: isLoadingContracts,
    refetch,
    isFetching: isFetchingContracts,
    isError,
  } = useStakingBackendSuspenseQuery(getContributionContracts, {
    refetchInterval,
  });

  const {
    networkBlsKeys,
    isFetching: isFetchingStakes,
    isLoading: isLoadingStakes,
  } = useStakes(address, refetchInterval);

  const enabledPublicBlsKeysQuery = !address;
  const {
    addedBlsKeys: addedBlsKeysPublic,
    isLoading: isLoadingPublicBlsKeys,
    isFetching: isFetchingPublicBlsKeys,
  } = useAddedBlsKeysPublic({ enabled: enabledPublicBlsKeysQuery, refetchInterval });

  const { contracts, network } = useMemo(() => {
    if (!data || (isLoadingStakes && isLoadingPublicBlsKeys))
      return { contracts: [], network: null };

    const [networkErr, network] = safeTrySyncWithFallback(() => data.network ?? null, null);
    if (networkErr) logger.error(networkErr);

    const [contractsErr, _contracts] = safeTrySyncWithFallback(
      () => getReadyContracts(data.contracts ?? []),
      []
    );
    if (contractsErr) logger.error(contractsErr);

    const contracts = parseOpenContracts(_contracts, address, networkBlsKeys, addedBlsKeysPublic);

    return { contracts, network };
  }, [data, address, networkBlsKeys, addedBlsKeysPublic, isLoadingStakes, isLoadingPublicBlsKeys]);

  const isLoading =
    isLoadingContracts || isLoadingStakes || (enabledPublicBlsKeysQuery && isLoadingPublicBlsKeys);

  const isFetching =
    isFetchingContracts ||
    isFetchingStakes ||
    (enabledPublicBlsKeysQuery && isFetchingPublicBlsKeys);

  return {
    contracts,
    network,
    refetch,
    isLoading,
    isFetching,
    isError,
  };
}
