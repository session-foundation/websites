import type { Address } from 'viem';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { getTotalStakedAmountForAddress } from '@/components/NodeCard';
import { formatSENTBigInt } from '@session/contracts/hooks/SENT';
import { useMemo } from 'react';
import { useStakes } from '@/hooks/useStakes';
import { parseStakeEventState, STAKE_EVENT_STATE } from '@/components/StakedNode/state';

export function useTotalStaked(addressOverride?: Address) {
  const { address: connectedAddress } = useWallet();
  const address = addressOverride ?? connectedAddress;

  const { stakes, contracts, refetch, status, enabled } = useStakes(addressOverride);

  const totalStakedAmount = useMemo(() => {
    if (!address) return formatSENTBigInt(0n);

    const stakedStakes = stakes.filter((stake) => {
      const eventState = parseStakeEventState(stake);
      return !(
        eventState === STAKE_EVENT_STATE.EXITED || eventState === STAKE_EVENT_STATE.LIQUIDATED
      );
    });

    const totalStakedAmountContracts = address
      ? contracts.reduce((acc, contract) => {
          const stakedBalance =
            getTotalStakedAmountForAddress(contract.contributors, address) ?? BigInt(0);
          return typeof stakedBalance !== 'bigint'
            ? acc + BigInt(stakedBalance)
            : acc + stakedBalance;
        }, BigInt(0))
      : 0n;

    const totalStakedAmountStakes = address
      ? stakedStakes.reduce((acc, stake) => {
          const stakedBalance =
            getTotalStakedAmountForAddress(stake.contributors, address) ?? BigInt(0);
          return typeof stakedBalance !== 'bigint'
            ? acc + BigInt(stakedBalance)
            : acc + stakedBalance;
        }, BigInt(0))
      : 0n;

    return formatSENTBigInt(totalStakedAmountContracts + totalStakedAmountStakes);
  }, [stakes, contracts, address]);

  return { totalStakedAmount, status, refetch, enabled };
}
