// #region - getBuildInfo

import type { Contributor } from '@session/sent-staking-js/client';
import { CHAIN, chains } from '@session/contracts';
import { ServiceNodeContributionAbi } from '@session/contracts/abis';
import { getContributionRangeFromContributors } from '../lib/maths';
import { createPublicClient, http } from 'viem';

const address = '0x63528ae9247165fd89f093a591238009720fb422';

function createContributor(amount: number) {
  return {
    address: '0x',
    beneficiary: '0x',
    locked_contributions: [],
    reserved: 0,
    amount,
  } as Contributor;
}

const operatorContributorAmounts = [
  5000000000000, 10000000000000, 15000000000000, 17500000000000, 5000000000001, 500000000002,
  500000000009, 5100000000000, 5000000000099, 10005001000000,
];

const operators = operatorContributorAmounts.map((amount) => createContributor(amount));

async function getMinContributionFromContract(contributors: Array<Contributor>) {
  const client = createPublicClient({
    chain: chains[CHAIN.TESTNET],
    transport: http('http://10.24.0.1/arb_sepolia'),
  });

  let remainingStake = 20000000000000n;

  for (const contributor of contributors) {
    remainingStake -= BigInt(contributor.amount);
  }

  return await client.readContract({
    address,
    abi: ServiceNodeContributionAbi,
    functionName: 'calcMinimumContribution',
    args: [remainingStake, BigInt(contributors.length), contributors.length ? 10n : 1n],
  });
}

async function contributionTest(contributors: Array<Contributor>) {
  const { minStake } = getContributionRangeFromContributors(contributors);

  const minFromContract = await getMinContributionFromContract(contributors);

  expect(minStake).toEqual(minFromContract);
}

describe('getContributionRangeFromContributors', () => {
  describe('0 contributor', () => {
    test.concurrent('first stake from operator', async () => contributionTest([]));
  });
  describe('1 contributor', () => {
    for (const operator of operators) {
      test.concurrent(`${operator.amount} contribution`, async () => contributionTest([operator]));
    }
  });
  describe('2nd contributor min', () => {
    for (const operator of operators) {
      const { minStake } = getContributionRangeFromContributors([operator]);
      test.concurrent(`${operator.amount} contribution, and ${minStake}`, async () =>
        contributionTest([operator, createContributor(Number(minStake))])
      );
    }
  });
  describe('2nd contributor min * 2', () => {
    for (const operator of operators) {
      const { minStake } = getContributionRangeFromContributors([operator]);
      const stake = minStake * 2n;
      test.concurrent(`${operator.amount} contribution, and ${stake}`, async () =>
        contributionTest([operator, createContributor(Number(stake))])
      );
    }
  });
});

/**
 * Generates a random bigint between min and max (inclusive) using standard library functions.
 * Note: This function is suitable when min and max are within the safe integer range of JavaScript numbers.
 * @param min - The minimum bigint value (inclusive).
 * @param max - The maximum bigint value (inclusive).
 * @returns A random bigint between min and max.
 */
function getRandomBigInt(min: bigint, max: bigint): bigint {
  const minNumber = Number(min);
  const maxNumber = Number(max);

  if (minNumber > maxNumber) {
    throw new Error('Minimum value must be less than or equal to maximum value.');
  }

  const randomNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
  return BigInt(randomNumber);
}

const getRandomOperatorContributorAmount = (): bigint =>
  getRandomBigInt(5000000000000n, 20000000000000n);
const getRandomContributorAmount = (min: bigint, max: bigint): bigint => getRandomBigInt(min, max);

function createRandomContributorArray() {
  const numContributors = Math.floor(Math.random() * 8) + 1;

  const operatorAmount = getRandomOperatorContributorAmount();

  const contributors = [createContributor(Number(operatorAmount))];

  for (let i = 0; i < numContributors; i++) {
    const { minStake, maxStake } = getContributionRangeFromContributors(contributors);
    const amount = getRandomContributorAmount(minStake, maxStake);
    contributors.push(createContributor(Number(amount)));
  }
  return contributors;
}

const fuzzAmount = 10000;
describe('getContributionRangeFromContributors fuzzing', () => {
  const tests = [];
  const testInfo = [];
  for (let i = 0; i < fuzzAmount; i++) {
    const contributors = createRandomContributorArray();
    let minStake: bigint;
    let totalStaked: bigint;
    try {
      const res = getContributionRangeFromContributors(contributors);
      minStake = res.minStake;
      totalStaked = res.totalStaked;
    } catch (e) {
      throw new Error(`Failed to get min stake for ${JSON.stringify(contributors)} ${e}`);
    }

    const contribTest = new Promise((resolve) => {
      getMinContributionFromContract(contributors).then((minFromContract) => {
        resolve({ minStake, minFromContract });
      });
    });

    tests.push(contribTest);
    testInfo.push({ totalStaked, minStake });
  }

  for (let i = 0; i < tests.length; i++) {
    const contribTest = tests[i];
    const contribTestInfo = testInfo[i];
    test.concurrent(
      `Fuzz testing next stake (${contribTestInfo?.totalStaked} totalStaked with min ${contribTestInfo?.minStake})`,
      async () => {
        const { minStake, minFromContract } = (await contribTest) as {
          minStake: bigint;
          minFromContract: bigint;
        };

        expect(minStake).toBe(minFromContract);
      }
    );
  }
});
