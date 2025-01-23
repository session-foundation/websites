import { useStakingBackendSuspenseQuery } from '@/lib/staking-api-client';
import { CONTRIBUTION_CONTRACT_STATUS } from '@session/staking-api-js/client';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useMemo } from 'react';
import type { Address } from 'viem';
import { sortContracts, useStakes } from '@/hooks/useStakes';
import { getContributionContracts } from '@/lib/queries/getContributionContracts';
import { useAddedBlsKeysPublic } from '@/hooks/useAddedBlsKeysPublic';
import { areHexesEqual } from '@session/util-crypto/string';

export function useOpenContributorContracts(overrideAddress?: Address) {
  const {
    data,
    isLoading: isLoadingContracts,
    refetch,
    isFetching: isFetchingContracts,
    isError,
  } = useStakingBackendSuspenseQuery(getContributionContracts);

  const {
    addedBlsKeys: addedBlsKeysFromStakes,
    isFetching: isFetchingStakes,
    isLoading: isLoadingStakes,
  } = useStakes();

  const { address: connectedAddress } = useWallet();
  const address = overrideAddress ?? connectedAddress;

  const enabledPublicBlsKeysQuery = !address;
  const {
    addedBlsKeys: addedBlsKeysPublic,
    isLoading: isLoadingPublicBlsKeys,
    isFetching: isFetchingPublicBlsKeys,
  } = useAddedBlsKeysPublic({ enabled: enabledPublicBlsKeysQuery });

  const [contracts, network] = useMemo(() => {
    if (!data || (!addedBlsKeysFromStakes && !addedBlsKeysPublic)) return [[], null];
    const contractsArr = 'contracts' in data && Array.isArray(data.contracts) ? data.contracts : [];

    const net = 'network' in data && data.network ? data.network : null;

    if (address) {
      contractsArr.sort((a, b) => sortContracts(a, b, address));
    }

    const stakesBlsKeys = addedBlsKeysFromStakes ?? new Set<string>();
    const publicBlsKeys = addedBlsKeysPublic ?? new Set<string>();

    const contractsFiltered = contractsArr
      .filter(
        ({ status, operator_address }) =>
          status === CONTRIBUTION_CONTRACT_STATUS.OpenForPublicContrib ||
          (areHexesEqual(operator_address, address) &&
            status === CONTRIBUTION_CONTRACT_STATUS.WaitForOperatorContrib)
      )
      .filter(({ pubkey_bls }) => {
        const key = pubkey_bls.slice(2);
        return !stakesBlsKeys.has(key) && !publicBlsKeys.has(key);
      });

    return [contractsFiltered, net];
  }, [data, address, addedBlsKeysFromStakes, addedBlsKeysPublic]);

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
