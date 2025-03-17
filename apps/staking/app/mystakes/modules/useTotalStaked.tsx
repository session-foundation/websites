import type { Address } from 'viem';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { getTotalStakedAmountForAddress } from '@/components/NodeCard';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import { useMemo } from 'react';
import { useStakes } from '@/hooks/useStakes';
import { parseStakeEventState, STAKE_EVENT_STATE } from '@/components/StakedNode/state';

// TODO: replace with sn data once available
export function useTotalStaked(addressOverride?: Address) {
  const { address: connectedAddress } = useWallet();
  const address = addressOverride ?? connectedAddress;

  const { stakes, contracts, refetch, status, enabled, currentContractIds } =
    useStakes(addressOverride);

  const { totalStakedBigInt, totalStakedFormatted } = useMemo(() => {
    if (!address) return { totalStakedBigInt: 0n, totalStakedFormatted: formatSENTBigInt(0n) };

    const stakedStakes = stakes.filter((stake) => {
      const eventState = parseStakeEventState(stake);
      return (
        !(eventState === STAKE_EVENT_STATE.EXITED) && currentContractIds?.has(stake.contract_id)
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

    const total = totalStakedAmountContracts + totalStakedAmountStakes;

    return {
      totalStakedBigInt: total,
      totalStakedFormatted: formatSENTBigInt(total),
    };
  }, [stakes, contracts, address]);

  return { totalStakedFormatted, totalStakedBigInt, status, refetch, enabled };
}
