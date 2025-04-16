import { useWallet } from '@session/wallet/hooks/useWallet';
import { useMemo } from 'react';
import { http, type Chain, createPublicClient } from 'viem';

const initPublicClient = (chain: Chain) =>
  createPublicClient({
    chain,
    transport: http(),
  });

export function usePublicWeb3Client() {
  const { chain } = useWallet();
  return useMemo(() => (chain ? initPublicClient(chain) : null), [chain]);
}
