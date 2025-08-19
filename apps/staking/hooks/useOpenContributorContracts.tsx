import { getReadyContracts } from '@/hooks/parseContracts';
import { parseOpenContracts } from '@/hooks/parseOpenContracts';
import { BACKEND, PREFERENCE } from '@/lib/constants';
import logger from '@/lib/logger';
import { getContributionContracts } from '@/lib/queries/getContributionContracts';
import { useStakingBackendSuspenseQuery } from '@/lib/staking-api-client';
import { useDevicePref } from '@/providers/preferences-provider';
import { useUser } from '@/providers/user-provider';
import { safeTrySyncWithFallback } from '@session/util-js/try';
import { useMemo } from 'react';

/**
 * Hook to get the current open contributor contracts.
 * @returns The open contributor contracts.
 */
export function useOpenContributorContracts() {
  const autoRefresh = !useDevicePref(PREFERENCE.DISABLE_BACKEND_AUTO_REFRESH);

  const {
    data,
    isLoading: isLoadingContracts,
    refetch,
    isFetching: isFetchingContracts,
    isError,
  } = useStakingBackendSuspenseQuery(getContributionContracts, {
    refetchInterval: autoRefresh ? BACKEND.L2_BACKGROUND_UPDATE_INTERVAL_SECONDS * 1000 : undefined,
  });

  const { contractNodes, activeAddress } = useUser();

  const isLoading = isLoadingContracts || contractNodes?.isLoading;
  const isFetching = isFetchingContracts || contractNodes?.isFetching;

  const { contracts, network } = useMemo(() => {
    if (isLoading || !data) {
      return { contracts: [], network: null };
    }

    const [networkErr, network] = safeTrySyncWithFallback(() => data.network ?? null, null);
    if (networkErr) logger.error(networkErr);

    const [contractsErr, _contracts] = safeTrySyncWithFallback(
      () => getReadyContracts(data.contracts ?? []),
      []
    );
    if (contractsErr) logger.error(contractsErr);

    const contracts = parseOpenContracts(
      _contracts,
      contractNodes.blsSet,
      contractNodes.ed25519Set,
      activeAddress
    );

    return { contracts, network };
  }, [data, activeAddress, contractNodes, isLoading]);

  return {
    contracts,
    network,
    refetch,
    isLoading,
    isFetching,
    isError,
  };
}
