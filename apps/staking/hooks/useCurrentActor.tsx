import { useActiveVestingContractAddress } from '@/providers/vesting-provider';
import { useWallet } from '@session/wallet/hooks/useWallet';

/**
 * Hook to get the current actor ethereum address.
 * If the user is connected to a vesting contract, the vesting contract address is returned.
 * Otherwise, the connected wallet address is returned.
 * @returns The current actor ethereum address.
 */
export function useCurrentActor() {
  const vestingContractAddress = useActiveVestingContractAddress();
  const { address: connectedAddress } = useWallet();

  return vestingContractAddress ?? connectedAddress;
}
