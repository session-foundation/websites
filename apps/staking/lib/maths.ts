import type { StakeContributor } from '@session/staking-api-js/client';
import type { ReservedContributorStruct } from '@/hooks/useCreateOpenNodeRegistration';
import type { Address } from 'viem';

const SESSION_NODE_FULL_STAKE_AMOUNT = 20000000000000n;

export const parseContributorDetails = (contributors: Array<ReservedContributorStruct> = []) => {
  let totalStaked = 0n;

  for (const contributor of contributors) {
    const amount = contributor.amount;
    totalStaked += amount;
  }

  if (totalStaked > SESSION_NODE_FULL_STAKE_AMOUNT) {
    throw new Error(
      `Total staked amount must be less than or equal to the full stake amount: ${totalStaked}`
    );
  }

  const remainingStake = SESSION_NODE_FULL_STAKE_AMOUNT - totalStaked;

  const min = calcMinimumContribution(
    remainingStake,
    BigInt(contributors.length),
    // If no contributors the first has to be the operator
    contributors.length ? 10n : 1n
  );

  return {
    maxStake: remainingStake,
    minStake: min,
    totalStaked: totalStaked,
  };
};

function calcMinimumContribution(
  contributionRemaining: bigint,
  numContributors: bigint,
  maxNumContributors: bigint
): bigint {
  if (maxNumContributors < numContributors) {
    throw new Error(
      `Number of contributors must be less than or equal to the max number of contributors. Max: ${maxNumContributors}, Current: ${numContributors}`
    );
  }

  if (contributionRemaining < 0n) {
    throw new Error(`contributionRemaining must be non-negative: ${contributionRemaining}`);
  }

  if (numContributors < 0n) {
    throw new Error(`numContributors must be non-negative: ${numContributors}`);
  }

  if (maxNumContributors < 0n) {
    throw new Error(`maxNumContributors must be non-negative, ${maxNumContributors}`);
  }

  let result: bigint;
  if (numContributors === 0n) {
    // Equivalent to Math.ceil(contributionRemaining / 4)
    result = contributionRemaining / 4n;
  } else {
    const slotsRemaining = maxNumContributors - numContributors;
    // Equivalent to Math.ceil(contributionRemaining / slotsRemaining)
    if (slotsRemaining) {
      result = (contributionRemaining + slotsRemaining - 1n) / slotsRemaining;
    } else {
      return 0n;
    }
  }
  return result;
}

export const getContributionRangeFromContributors = (contributors: Array<StakeContributor> = []) =>
  parseContributorDetails(
    contributors.map(({ amount, reserved, address }) => {
      return { amount: BigInt(amount || reserved), addr: address as Address };
    })
  );

export const getContributionRangeFromContributorsIgnoreReserved = (
  contributors: Array<StakeContributor> = []
) =>
  parseContributorDetails(
    contributors.map(({ amount, address }) => {
      return { amount: BigInt(amount), addr: address as Address };
    })
  );

export const getTotalStaked = (contributors: Array<StakeContributor> = []) =>
  contributors.reduce((acc, { amount }) => acc + BigInt(amount), 0n);
