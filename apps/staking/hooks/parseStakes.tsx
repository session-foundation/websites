import type { ContributionContract, Stake } from '@session/staking-api-js/schema';
import { bigIntSortDesc } from '@session/util-crypto/maths';
import { areHexesEqual } from '@session/util-crypto/string';
import type { Address } from 'viem';
import {
  STAKE_STATE,
  isStakeRequestingExit,
  parseStakeState,
} from '../components/StakedNode/state';
import { getTotalStakedAmountForAddress } from '../components/getTotalStakedAmountForAddress';

/**
 * Sorts stakes by total staked amount descending.
 * @param a - The first stake to compare.
 * @param b - The second stake to compare.
 * @param address - The address to filter by.
 * @returns The sorted stakes.
 */
export const sortingTotalStakedDesc = (
  a: Stake | ContributionContract,
  b: Stake | ContributionContract,
  address?: Address
) => {
  const stakedA = address ? getTotalStakedAmountForAddress(a.contributors, address) : 0n;
  const stakedB = address ? getTotalStakedAmountForAddress(b.contributors, address) : 0n;
  return bigIntSortDesc(stakedB, stakedA);
};

/**
 * Sorts reserved contracts by total staked amount descending.
 * @param a - The first contract to compare.
 * @param b - The second contract to compare.
 * @param connectedAddress - The connected address to filter by.
 * @returns The sorted contracts.
 */
export const sortingReservedContractsDesc = (
  a: ContributionContract,
  b: ContributionContract,
  connectedAddress?: Address
) => {
  const reservedA = connectedAddress
    ? (a.contributors.find(({ address }) => areHexesEqual(address, connectedAddress))?.reserved ??
      0n)
    : 0n;

  const reservedB = connectedAddress
    ? (b.contributors.find(({ address }) => areHexesEqual(address, connectedAddress))?.reserved ??
      0n)
    : 0n;

  return bigIntSortDesc(reservedB, reservedA);
};

const stakeStateSortOrder = {
  [STAKE_STATE.DECOMMISSIONED]: 1,
  [STAKE_STATE.AWAITING_EXIT]: 2,
  [STAKE_STATE.RUNNING]: 3,
  [STAKE_STATE.DEREGISTERED]: 4,
  [STAKE_STATE.EXITED]: 5,
  [STAKE_STATE.UNKNOWN]: 6,
} as const;

/**
 * Stakes are sorted by {@link stakeStateSortOrder} ascending
 * then by the amount staked by the connected wallet descending
 * then by the operator fee ascending
 *
 * NOTE: If both stakes are {@link STAKE_STATE.DECOMMISSIONED} then they are sorted by earned_downtime_blocks ascending
 * NOTE: If both stakes are {@link STAKE_STATE.AWAITING_EXIT} then they are sorted by requested_unlock_height ascending
 */
export function sortStakes(a: Stake, b: Stake, address?: Address, blockHeight = 0) {
  const stateA = parseStakeState(a, blockHeight);
  const stateB = parseStakeState(b, blockHeight);

  let priorityA = stakeStateSortOrder[stateA] ?? 999;
  let priorityB = stakeStateSortOrder[stateB] ?? 999;

  if (isStakeRequestingExit(a) && stateA !== STAKE_STATE.DEREGISTERED) {
    priorityA = stakeStateSortOrder[STAKE_STATE.AWAITING_EXIT] + 0.1;
  }

  if (isStakeRequestingExit(b) && stateB !== STAKE_STATE.DEREGISTERED) {
    priorityB = stakeStateSortOrder[STAKE_STATE.AWAITING_EXIT] + 0.1;
  }

  if (priorityA !== priorityB) {
    // Priority ascending
    return priorityA - priorityB;
  }

  // NOTE: By definition, if the priorities are the same the state is the same

  if (stateA === STAKE_STATE.DECOMMISSIONED || stateB === STAKE_STATE.DECOMMISSIONED) {
    // earned_downtime_blocks ascending
    return (
      (a.earned_downtime_blocks ?? Number.POSITIVE_INFINITY) -
      (b.earned_downtime_blocks ?? Number.POSITIVE_INFINITY)
    );
  }

  if (isStakeRequestingExit(a) || isStakeRequestingExit(b)) {
    // requested_unlock_height ascending
    return (
      (a.requested_unlock_height ?? Number.POSITIVE_INFINITY) -
      (b.requested_unlock_height ?? Number.POSITIVE_INFINITY)
    );
  }

  const stakeSort = sortingTotalStakedDesc(a, b, address);
  if (stakeSort) return stakeSort;

  // operator_fee ascending
  return (a.operator_fee ?? 0) - (b.operator_fee ?? 0);
}
