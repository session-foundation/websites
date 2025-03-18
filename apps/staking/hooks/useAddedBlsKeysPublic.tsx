import { getNodesBlsKeys } from '@/lib/queries/getNodesBlsKeys';
import { useStakingBackendQuery } from '@/lib/staking-api-client';
import { useMemo } from 'react';

/**
 * Hook to get the added BLS keys.
 * NOTE: This should only be used if the user has NOT connected their wallet.
 * @param enabled - Whether the query should be enabled.
 */
export function useAddedBlsKeysPublic({ enabled }: { enabled: boolean }) {
  const { data, isLoading, isFetching } = useStakingBackendQuery(getNodesBlsKeys, { enabled });

  const addedBlsKeys = useMemo(() => {
    if (!data) return null;

    const blsKeysObject =
      'bls_keys' in data && typeof data.bls_keys === 'object' ? data.bls_keys : {};

    return new Set(Object.keys(blsKeysObject));
  }, [data]);

  return {
    addedBlsKeys,
    isLoading,
    isFetching,
  };
}
