import { BACKEND, PREFERENCE } from '@/lib/constants';
import { getContractNodes } from '@/lib/queries/getContractNodes';
import { useStakingBackendQuery } from '@/lib/staking-api-client';
import { useDevicePref } from '@/providers/preferences-provider';
import type { BLSPublicKey, Ed25519PublicKey } from '@session/util-crypto/keys';
import { useMemo } from 'react';

/**
 * Hook to get the added contract nodes and their keys.
 */
export function useContractNodes() {
  const autoRefresh = useDevicePref(PREFERENCE.DISABLE_BACKEND_AUTO_REFRESH);
  const { data, isLoading, isFetching } = useStakingBackendQuery(getContractNodes, {
    enabled: true,
    refetchInterval: autoRefresh ? BACKEND.NODE_TARGET_UPDATE_INTERVAL_SECONDS * 1000 : undefined,
  });

  const { contractIdSet, blsSet, ed25519Set } = useMemo(() => {
    const blsSet = new Set<BLSPublicKey>();
    const ed25519Set = new Set<Ed25519PublicKey>();
    const contractIdSet = new Set<number>();

    if (data) {
      for (const [contractId, { bls, ed25519, in: nodeIn }] of Object.entries(data.nodes)) {
        if (nodeIn) {
          blsSet.add(bls);
          ed25519Set.add(ed25519);
          contractIdSet.add(Number(contractId));
        }
      }
    }

    return {
      contractIdSet,
      blsSet,
      ed25519Set,
    };
  }, [data]);

  return {
    contractIdSet,
    blsSet,
    ed25519Set,
    isLoading,
    isFetching,
  };
}
