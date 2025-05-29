import { useEns } from '@web3sheet/core';
import { useEffect, useRef } from 'react';
import { type Address, isAddress } from 'viem';

/**
 * ENS resolution result cache for the session. We don't want to expire any items, the cache will
 * reset if/when the user launches the app.
 */
const cache = new Map();

function useEnsCacheOnMount(address: string) {
  const cachedName = useRef<string | undefined>(cache.get(address));
  const hasCachedName = useRef<boolean>(cache.has(address));

  return {
    cachedName,
    hasCachedName,
  };
}

export function useEnsName(address: string) {
  const { cachedName, hasCachedName } = useEnsCacheOnMount(address);

  /**
   * A bug in wagmi causes an ens resolution query to occur regardless of enabled flag, as long
   * as there is an address it will fetch, this logic resolved it by passing undefined to address
   * when disabled.
   * TODO: Fix the bug in wagmi's useEnsName hook
   */
  const enabled = isAddress(address) && !hasCachedName.current;
  const addressForQuery = enabled ? address : undefined;
  const { ensName: fetchedName } = useEns({ address: addressForQuery as Address, enabled });

  const ensName = fetchedName ?? cachedName.current;
  const hasName = !!ensName;

  useEffect(() => {
    /**
     * `undefined` or `string` means the name resolved and either exists or doesn't, we want to cache
     * it in both cases. `null` means the request is in-flight.
     */
    if (ensName !== null) {
      cache.set(address, ensName);
    }
  }, [ensName, address]);

  return {
    ensName,
    hasName,
  };
}
