import { STAKE_STATE, parseStakeState } from '@/components/StakedNode/state';
import { parseStakes } from '@/hooks/parseStakes';
import { BACKEND, BLOCK_TIME_MS, PREFERENCE, SESSION_NODE_TIME } from '@/lib/constants';
import logger from '@/lib/logger';
import { getStakedNodes } from '@/lib/queries/getStakedNodes';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { useNodesWithConfirmations } from '@/lib/volatile-storage';
import { areHexesEqual } from '@session/util-crypto/string';
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
    nodes: { nodesConfirmingRegistration },
  } = useNodesWithConfirmations();

  const {
    stakes,
    vesting,
    hiddenContractsWithStakes,
    awaitingOperatorContracts,
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

    const [addedBlsKeysSetsError, addedBlsKeys] = safeTrySyncWithFallback(
      () => data?.added_bls_keys ?? {},
      {}
    );
    if (addedBlsKeysSetsError) logger.error(addedBlsKeysSetsError);

    const [vestingErr, vesting] = safeTrySyncWithFallback(() => data?.vesting ?? [], []);
    if (vestingErr) logger.error(vestingErr);

    const [contractsErr, contracts] = safeTrySyncWithFallback(() => data?.contracts ?? [], []);
    if (contractsErr) logger.error(contractsErr);

    //Minimum time in seconds that a node can go from "joining" to "exited"
    const nodeMinLifespan = SESSION_NODE_TIME(chainId).EXIT_REQUEST_TIME_SECONDS;
    // Minimum time in blocks that a node can go from "joining" to "exited"
    const nodeMinLifespanArbBlocks = (nodeMinLifespan * 1000) / BLOCK_TIME_MS.ARBITRUM;

    return {
      ...parseStakes({
        contracts,
        address,
        blockHeight,
        addedBlsKeys,
        nodeMinLifespanArbBlocks,
        stakes,
        vesting,
      }),
      network,
      networkTime,
    };
  }, [data, address, chainId]);

  const notFoundJoiningNodes = useMemo(
    () =>
      nodesConfirmingRegistration.filter((node) => {
        return (
          areHexesEqual(node.confirmationOwner, address) &&
          !joiningContracts.some(
            ({ pubkey_bls, service_node_pubkey }) =>
              pubkey_bls === node.pubkeyBls ||
              areHexesEqual(service_node_pubkey, node.pubkeyEd25519)
          ) &&
          !stakes.some((stake) => {
            const state = parseStakeState(stake, blockHeight);
            if (state === STAKE_STATE.DEREGISTERED) {
              return false;
            }
            return (
              stake.pubkey_bls === node.pubkeyBls || stake.pubkey_ed25519 === node.pubkeyEd25519
            );
          })
        );
      }),
    [nodesConfirmingRegistration, stakes, joiningContracts, blockHeight, address]
  );

  return {
    stakes,
    visibleContracts,
    joiningContracts,
    notFoundJoiningNodes,
    awaitingOperatorContracts,
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
