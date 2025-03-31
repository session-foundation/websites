import { STAKE_EVENT_STATE, parseStakeEventState } from '@/components/StakedNode/state';
import { parseContracts } from '@/hooks/parseContracts';
import { sortStakes } from '@/hooks/parseStakes';
import { getReadyContracts } from '@/hooks/useContributeStakeToOpenNode';
import { BACKEND, BLOCK_TIME_MS, PREFERENCE, SESSION_NODE_TIME } from '@/lib/constants';
import logger from '@/lib/logger';
import { getStakedNodes } from '@/lib/queries/getStakedNodes';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { bigIntSortDesc } from '@session/util-crypto/maths';
import { safeTrySyncWithFallback } from '@session/util-js/try';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useMemo } from 'react';
import { usePreferences } from 'usepref';
import type { Address } from 'viem';

/**
 * Hook to get the stakes and related data for the connected wallet.
 * @param overrideAddress - override address, this overrides the connected address
 * @param autoUpdateIntervalOverride - override the auto update interval
 * @returns The stakes and related data for the connected wallet.
 */
export function useStakes(overrideAddress?: Address, autoUpdateIntervalOverride?: number) {
  const { address: connectedAddress, chainId } = useWallet();
  const address = overrideAddress ?? connectedAddress;
  const { getItem } = usePreferences();

  const enabled = !!address;
  const autoRefresh = !!getItem<boolean>(PREFERENCE.AUTO_REFRESH_BACKEND);

  const { data, isLoading, isFetching, refetch, isError, status } =
    useStakingBackendQueryWithParams(
      getStakedNodes,
      {
        address: address!,
      },
      {
        enabled,
        refetchInterval: autoRefresh
          ? (autoUpdateIntervalOverride ?? BACKEND.NODE_TARGET_UPDATE_INTERVAL_SECONDS * 1000)
          : undefined,
      }
    );

  const {
    stakes,
    vesting,
    hiddenContractsWithStakes,
    networkContractIds,
    visibleContracts,
    networkBlsKeys,
    joiningContracts,
    network,
    blockHeight,
    networkTime,
  } = useMemo(() => {
    const [networkError, network] = safeTrySyncWithFallback(() => data?.network ?? null, null);
    if (networkError) logger.error(networkError);

    const [blockHeightError, blockHeight] = safeTrySyncWithFallback(
      () => network?.block_height ?? 0,
      0
    );
    if (blockHeightError) logger.error(blockHeightError);

    const [networkTimeError, networkTime] = safeTrySyncWithFallback(
      () => network?.block_timestamp ?? 0,
      0
    );
    if (networkTimeError) logger.error(networkTimeError);

    const [stakesError, stakes] = safeTrySyncWithFallback(() => data?.stakes ?? [], []);
    if (stakesError) logger.error(stakesError);

    stakes.sort((a, b) => sortStakes(a, b, address, blockHeight));

    const [addedBlsKeysSetsError, addedBlsKeys] = safeTrySyncWithFallback(
      () => data?.added_bls_keys ?? {},
      {}
    );
    if (addedBlsKeysSetsError) logger.error(addedBlsKeysSetsError);

    const runningStakesBlsKeysSet = new Set(
      stakes
        .filter((stake) => parseStakeEventState(stake) === STAKE_EVENT_STATE.ACTIVE)
        .map(({ pubkey_bls }) => pubkey_bls)
    );

    const [vestingErr, vesting] = safeTrySyncWithFallback(() => data?.vesting ?? [], []);
    if (vestingErr) logger.error(vestingErr);

    vesting.sort((a, b) => bigIntSortDesc(a.initial_amount, b.initial_amount));

    const [contractsErr, contracts] = safeTrySyncWithFallback(
      () => getReadyContracts(data?.contracts ?? []),
      []
    );
    if (contractsErr) logger.error(contractsErr);

    //Minimum time in seconds that a node can go from "joining" to "exited"
    const nodeMinLifespan = SESSION_NODE_TIME(chainId).EXIT_REQUEST_TIME_SECONDS;
    // Minimum time in blocks that a node can go from "joining" to "exited"
    const nodeMinLifespanArbBlocks = (nodeMinLifespan * 1000) / BLOCK_TIME_MS.ARBITRUM;

    return {
      ...parseContracts({
        contracts,
        address,
        blockHeight,
        addedBlsKeys,
        nodeMinLifespanArbBlocks,
        runningStakesBlsKeysSet,
      }),
      stakes,
      vesting,
      network,
      blockHeight,
      networkTime,
    };
  }, [data, address, chainId]);

  return {
    stakes,
    visibleContracts,
    joiningContracts,
    vesting,
    hiddenContractsWithStakes,
    networkBlsKeys,
    networkContractIds,
    network,
    blockHeight,
    networkTime,
    refetch,
    isLoading,
    isFetching,
    isError,
    status,
    enabled,
  };
}
