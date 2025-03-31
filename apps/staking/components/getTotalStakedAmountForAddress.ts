import type {
  ContributionContractContributor,
  StakeContributor,
} from '@session/staking-api-js/schema';
import { areHexesEqual } from '@session/util-crypto/string';

/**
 * Returns the total staked amount for a given address.
 * @param contributors - The list of contributors.
 * @param address - The address to check.
 * @returns The total staked amount for the given address.
 */
export const getTotalStakedAmountForAddress = (
  contributors: Array<StakeContributor | ContributionContractContributor>,
  address: string
): bigint => {
  return contributors.reduce((acc, { amount, address: contributorAddress }) => {
    return areHexesEqual(contributorAddress, address) ? acc + amount : acc;
  }, 0n);
};
