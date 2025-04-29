import { useWallet } from './useWallet';

export const useIsSupportedChain = () => {
  const { chainId, chains } = useWallet();

  return !chainId || !!chains.find((chain) => chain.id === chainId);
};
