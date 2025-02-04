import type { StakeContributor } from '@session/staking-api-js/client';

const SESSION_NODE_FULL_STAKE_AMOUNT = 20000000000000n;

export const getContributionRangeFromContributors = (
  contributors: Array<StakeContributor> = []
) => {
  let totalStaked = 0n;

  for (const contributor of contributors) {
    const amount = BigInt(contributor.amount);
    totalStaked += amount;
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
  if (maxNumContributors <= numContributors) {
    throw new Error("Max contributors can't be greater than the max number of contributors");
  }

  if (contributionRemaining < 0n) {
    throw new Error(`contributionRemaining must be non-negative`);
  }

  if (numContributors < 0n) {
    throw new Error(`numContributors must be non-negative`);
  }

  if (maxNumContributors < 0n) {
    throw new Error(`maxNumContributors must be non-negative`);
  }

  let result: bigint;
  if (numContributors === 0n) {
    // Equivalent to Math.ceil(contributionRemaining / 4)
    result = (contributionRemaining + 3n) / 4n;
  } else {
    const slotsRemaining = maxNumContributors - numContributors;
    // Equivalent to Math.ceil(contributionRemaining / slotsRemaining)
    result = (contributionRemaining + slotsRemaining - 1n) / slotsRemaining;
  }
  return result;
}
