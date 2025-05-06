import { useCurrentActor } from '@/hooks/useCurrentActor';
import { useNetworkBalances } from '@/hooks/useNetworkBalances';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import type { Address } from 'viem';

export function useTotalStaked(addressOverride?: Address) {
  const connectedAddress = useCurrentActor();
  const address = addressOverride ?? connectedAddress;

  const { lockedStakes, refetch, status, enabled } = useNetworkBalances({
    addressOverride: address,
  });

  const totalStakedFormatted = formatSENTBigInt(lockedStakes);

  return { totalStakedFormatted, totalStaked: lockedStakes, status, refetch, enabled };
}
