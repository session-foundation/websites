import { STAKE_EVENT_STATE, parseStakeEventState } from '@/components/StakedNode/state';
import { getTotalStakedAmountForAddress } from '@/components/getTotalStakedAmountForAddress';
import { useCurrentActor } from '@/hooks/useCurrentActor';
import { useStakes } from '@/hooks/useStakes';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import { useMemo } from 'react';
import type { Address } from 'viem';

// TODO: replace with sn data once available
export function useTotalStaked(addressOverride?: Address) {
  const connectedAddress = useCurrentActor();
  const address = addressOverride ?? connectedAddress;

  const { stakes, hiddenContractsWithStakes, visibleContracts, refetch, status, enabled, networkContractIds } =
    useStakes(addressOverride);

  const { totalStakedBigInt, totalStakedFormatted } = useMemo(() => {
    if (!address) return { totalStakedBigInt: 0n, totalStakedFormatted: formatSENTBigInt(0n) };

    const stakedStakes = stakes.filter((stake) => {
      const eventState = parseStakeEventState(stake);
      return (
        !(eventState === STAKE_EVENT_STATE.EXITED) && networkContractIds?.has(stake.contract_id)
      );
    });

    const totalStakedAmountContracts = address
      ? visibleContracts.reduce((acc, contract) => {
          const stakedBalance =
            getTotalStakedAmountForAddress(contract.contributors, address) ?? 0n;
          return acc + stakedBalance;
        }, 0n)
      : 0n;

    const totalStakedAmountHiddenContracts = address
      ? hiddenContractsWithStakes.reduce((acc, contract) => {
          const stakedBalance =
            getTotalStakedAmountForAddress(contract.contributors, address) ?? 0n;
          return acc + stakedBalance;
        }, 0n)
      : 0n;

    const totalStakedAmountStakes = address
      ? stakedStakes.reduce((acc, stake) => {
          const stakedBalance = getTotalStakedAmountForAddress(stake.contributors, address) ?? 0n;
          return acc + stakedBalance;
        }, 0n)
      : 0n;

    const total = totalStakedAmountContracts + totalStakedAmountStakes + totalStakedAmountHiddenContracts;

    return {
      totalStakedBigInt: total,
      totalStakedFormatted: formatSENTBigInt(total),
    };
  }, [stakes, hiddenContractsWithStakes, visibleContracts, address, networkContractIds]);

  return { totalStakedFormatted, totalStakedBigInt, status, refetch, enabled };
}
