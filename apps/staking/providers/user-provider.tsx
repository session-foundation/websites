'use client';

import { useContractNodes } from '@/hooks/useContractNodes';
import { useCurrentActor } from '@/hooks/useCurrentActor';
import { useNetworkVersionInfo } from '@/hooks/useNetworkVersionInfo';
import { useAddressStakes } from '@/hooks/useStakes';
import { useVestingContracts } from '@/hooks/useVestingContracts';
import { type EthereumAddress, isEthereumAddress } from '@session/util-crypto/keys';
import { useWallet } from '@session/wallet/hooks/useWallet';
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

type UserContext = {
  activeAddress: EthereumAddress | undefined;
  connectedAddress: EthereumAddress | undefined;
  setManualAddress: Dispatch<SetStateAction<EthereumAddress | undefined>>;
  stakes: ReturnType<typeof useAddressStakes>;
  vesting: ReturnType<typeof useVestingContracts>;
  contractNodes: ReturnType<typeof useContractNodes>;
  network: ReturnType<typeof useNetworkVersionInfo>;
};

const Context = createContext<UserContext | undefined>(undefined);

export default function UserProvider({ children }: { children: ReactNode }) {
  const [manualAddress, setManualAddress] = useState<EthereumAddress | undefined>(undefined);

  const { address: connectedWalletAddress } = useWallet();

  const connectedAddress = useMemo(
    () =>
      connectedWalletAddress && isEthereumAddress(connectedWalletAddress)
        ? connectedWalletAddress
        : undefined,
    [connectedWalletAddress]
  );

  const contractNodes = useContractNodes();
  const stakes = useAddressStakes(contractNodes, connectedAddress);
  const vesting = useVestingContracts();

  const currentActorAddress = useCurrentActor();

  const activeAddress = useMemo(() => {
    const addr = manualAddress ?? currentActorAddress;
    return addr && isEthereumAddress(addr) ? addr : undefined;
  }, [manualAddress, currentActorAddress]);

  const network = useNetworkVersionInfo();

  return (
    <Context.Provider
      value={{
        activeAddress,
        connectedAddress,
        setManualAddress,
        stakes,
        network,
        contractNodes,
        vesting,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export const useUser = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error('useUser must be used inside UserProvider');
  }

  return context;
};

export function useStakes() {
  return useUser().stakes;
}
