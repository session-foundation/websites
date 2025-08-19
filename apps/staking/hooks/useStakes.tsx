import { STAKE_STATE, parseStakeState } from '@/components/StakedNode/state';
import { parseStakes } from '@/hooks/parseStakes';
import type { useContractNodes } from '@/hooks/useContractNodes';
import { BACKEND, BLOCK_TIME_MS, PREFERENCE, SESSION_NODE } from '@/lib/constants';
import { NEXT_PUBLIC_TESTNET } from '@/lib/env';
import logger from '@/lib/logger';
import { getStakedNodes } from '@/lib/queries/getStakedNodes';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { useNodesWithConfirmations } from '@/lib/volatile-storage';
import type { EthereumAddress } from '@session/util-crypto/keys';
import { bigIntToNumber } from '@session/util-crypto/maths';
import { areEd25519KeysEqual, areEthereumAddressesEqual } from '@session/util-crypto/string';
import { safeTrySyncWithFallback } from '@session/util-js/try';
import { useBlockNumber } from '@session/wallet/hooks/useBlockNumber';
import { useMemo } from 'react';
import { usePreferences } from 'usepref';
import { arbitrum, arbitrumSepolia } from 'viem/chains';

/**
 * Hook to get the stakes and related data for the connected wallet.
 * @param contractNodes - Return of useContractNodes
 * @param address - Address to get stakes for
 * @returns The stakes and related data for the connected wallet.
 */
export function useAddressStakes(
  contractNodes: ReturnType<typeof useContractNodes>,
  address?: EthereumAddress
) {
  const { getItem } = usePreferences();
  const enabled = !!address;
  const autoRefresh = !getItem<boolean>(PREFERENCE.DISABLE_BACKEND_AUTO_REFRESH);

  const { data: arbBlock } = useBlockNumber({
    chainId: NEXT_PUBLIC_TESTNET ? arbitrumSepolia.id : arbitrum.id,
    query: {
      gcTime: BACKEND.NODE_TARGET_UPDATE_INTERVAL_SECONDS * 1000,
    },
  });

  const { data, isLoading, isFetching, refetch, isError, error, status } =
    useStakingBackendQueryWithParams(
      getStakedNodes,
      {
        address: address!,
      },
      {
        enabled,
        refetchInterval: autoRefresh
          ? BACKEND.NODE_TARGET_UPDATE_INTERVAL_SECONDS * 1000
          : undefined,
      }
    );

  if (isError) {
    console.error(error);
  }

  const {
    nodes: { nodesConfirmingRegistration },
  } = useNodesWithConfirmations();

  const {
    stakes,
    hiddenContractsWithStakes,
    awaitingOperatorContracts,
    visibleContracts,
    joiningContracts,
    network,
    blockHeight,
    networkTime,
    // biome-ignore lint/correctness/useExhaustiveDependencies(arbBlock): we don't want to recompute if this changes, its used as a buffer so only needed when we calculate this.
  } = useMemo(() => {
    if (contractNodes.isLoading || !data) {
      return {
        stakes: [],
        hiddenContractsWithStakes: [],
        awaitingOperatorContracts: [],
        visibleContracts: [],
        joiningContracts: [],
        network: null,
        blockHeight: 0,
        networkTime: 0,
      };
    }

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

    const [contractsErr, contracts] = safeTrySyncWithFallback(() => data?.contracts ?? [], []);
    if (contractsErr) logger.error(contractsErr);

    // Minimum time in blocks that a node can go from "joining" to "exited"
    const nodeMinLifespanArbBlocks =
      (arbBlock ? bigIntToNumber(arbBlock, 0) : 0) -
      SESSION_NODE.INITIAL_DOWNTIME_CREDITS_MS / BLOCK_TIME_MS.ARBITRUM;

    return {
      ...parseStakes({
        contracts,
        address,
        blockHeight,
        nodeMinLifespanArbBlocks,
        stakes,
        contractBlsKeys: contractNodes.blsSet,
        contractEd25519Keys: contractNodes.ed25519Set,
      }),
      network,
      networkTime,
    };
  }, [data, address, contractNodes]);

  const notFoundJoiningNodes = useMemo(
    () =>
      address
        ? nodesConfirmingRegistration.filter((node) => {
            return (
              areEthereumAddressesEqual(node.confirmationOwner, address) &&
              !joiningContracts.some(
                ({ pubkey_bls, service_node_pubkey }) =>
                  pubkey_bls === node.pubkeyBls ||
                  areEd25519KeysEqual(service_node_pubkey, node.pubkeyEd25519)
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
          })
        : [],
    [nodesConfirmingRegistration, stakes, joiningContracts, blockHeight, address]
  );

  return {
    stakes,
    visibleContracts,
    joiningContracts,
    notFoundJoiningNodes,
    awaitingOperatorContracts,
    hiddenContractsWithStakes,
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
