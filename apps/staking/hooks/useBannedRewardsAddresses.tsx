import { useUser } from '@/providers/user-provider';
import { addresses, isValidChainId } from '@session/contracts';
import { ETH_ZERO_ADDRESS } from '@session/util-crypto/constants';
import { isEthereumAddress } from '@session/util-crypto/keys';
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
  const { vesting } = useUser();

  return useMemo(() => {
    if (!isValidChainId(chainId)) return [];

    const contracts = [
      addresses.ServiceNodeRewards[chainId],
      addresses.ServiceNodeContributionFactory[chainId],
      addresses.Token[chainId],
      ETH_ZERO_ADDRESS,
    ]
      .filter(isEthereumAddress)
      .map((address) => ({ address, errorMessage: dictRewardsAddress('bannedSessionContract') }));

    const vestingContracts = vesting.contracts.map(({ address }) => ({
      address,
      errorMessage: dictRewardsAddress('bannedVestingContract'),
    }));

    return contracts.concat(vestingContracts);
  }, [chainId, vesting, dictRewardsAddress]);
}
