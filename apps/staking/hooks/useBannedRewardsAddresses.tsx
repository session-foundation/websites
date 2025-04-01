// import { useStakes } from '@/hooks/useStakes';
import { addresses, isValidChainId } from '@session/contracts';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

/**
 * Hook to get the banned rewards addresses.
 * @returns The banned rewards addresses.
 * These addresses are not allowed to receive rewards and are used to prevent users from inputting them in address fields.
 */
export function useBannedRewardsAddresses() {
  const dictRewardsAddress = useTranslations('actionModules.rewardsAddress.validation');
  const { chainId } = useWallet();
  // const { vesting } = useStakes();

  return useMemo(() => {
    if (!isValidChainId(chainId)) return [];

    const contracts = [
      addresses.ServiceNodeRewards[chainId],
      addresses.ServiceNodeContributionFactory[chainId],
      addresses.Token[chainId],
    ].map((address) => ({ address, errorMessage: dictRewardsAddress('bannedSessionContract') }));

    /** TODO: uncomment when we have vesting contracts
    const vestingContracts = vesting.map(({ address }) => ({
      address,
      errorMessage: dictRewardsAddress('bannedVestingContract'),
    }));

    return contracts.concat(vestingContracts);
      */
    return contracts;
  }, [chainId, dictRewardsAddress]);
}
