import { useWallet } from '@session/wallet/hooks/useWallet';
import { type Chain, createPublicClient, http } from 'viem';
import { useMemo } from 'react';

const initPublicClient = (chain: Chain) =>
  createPublicClient({
    chain,
    transport: http(),
  });

export function usePublicWeb3Client() {
  const { chain } = useWallet();
  return useMemo(() => (chain ? initPublicClient(chain) : null), [chain]);
}
