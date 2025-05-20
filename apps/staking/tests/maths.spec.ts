import { ServiceNodeContributionAbi } from '@session/contracts/abis';
import { http, type Address, createPublicClient } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { parseContributorDetails } from '../lib/maths';

type Contributor = {
  addr: Address;
  amount: bigint;
};

const address = '0x63528ae9247165fd89f093a591238009720fb422';
const RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC_URL;
const isCI = process.env.CI === 'true';

const FULL_STAKE_AMOUNT = 25_000_000000000n;
const MAX_CONTRIBUTORS = 10;

function createContributor(amount: bigint): Contributor {
  return {
    addr: '0x',
    amount,
  };
}

const operatorContributorAmounts = [
  5000_000000000n,
  10000_000000000n,
  15000_000000000n,
  17500_000000000n,
  50000_00000001n,
  50000_0000002n,
  50000_0000009n,
  51000_00000000n,
  50000_00000099n,
  10005_001000000n,
  11111_111111111n,
  9999_000000000n,
  9999_999999999n,
];

for (const amount of operatorContributorAmounts) {
  if (amount > FULL_STAKE_AMOUNT) {
    throw new Error(
      `Operator amount must be less than or equal to the full stake amount: ${amount}`
    );
  }
}

const operators = operatorContributorAmounts.map((amount) => createContributor(amount));

async function getMinContributionFromContract(contributors: Array<Contributor>) {
  const client = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(RPC_URL),
  });

  let remainingStake = FULL_STAKE_AMOUNT;

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
  const { minStake } = parseContributorDetails(contributors);

  let error: Error | null = null;
  let minFromContract = 0n;
  try {
    minFromContract = await getMinContributionFromContract(contributors);
  } catch (e) {
    error = e as Error;
  }

  if (contributors.length === MAX_CONTRIBUTORS) {
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toContain('CalcMinContributionGivenBadContribArgs');
  } else {
    expect(minStake).toEqual(minFromContract);
  }
}

describe('parseContributorDetails', () => {
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
      const { minStake } = parseContributorDetails([operator]);
      test.concurrent(`${operator.amount} contribution, and ${minStake}`, async () =>
        contributionTest([operator, createContributor(minStake)])
      );
    }
  });
  describe('2nd contributor min * 2', () => {
    for (const operator of operators) {
      const { minStake } = parseContributorDetails([operator]);
      const stake = minStake * 2n;
      test.concurrent(`${operator.amount} contribution, and ${stake}`, async () =>
        contributionTest([operator, createContributor(stake)])
      );
    }
  });
  describe('All contributors contribute minStake', () => {
    const contributors = [createContributor(5000_000000000n)];
    const { minStake: firstMinStake } = parseContributorDetails(contributors);
    let lastMinStake = firstMinStake;
    for (let i = 0; i < MAX_CONTRIBUTORS - 1; i++) {
      contributors.push(createContributor(lastMinStake));
      test.concurrent(`All contributors contribute ${lastMinStake}`, async () =>
        contributionTest(contributors)
      );
      const { minStake } = parseContributorDetails(contributors);
      lastMinStake = minStake;
    }
    test('Contributors are at max number of contributors', () => {
      expect(contributors.length).toEqual(MAX_CONTRIBUTORS);
    });
  });
  describe('Full node resolves stakes properly', () => {
    const fullContributorList = [
      createContributor(11000_000000000n),
      ...Array.from({ length: MAX_CONTRIBUTORS - 1 }, () => createContributor(1000_000000000n)),
    ];

    expect(fullContributorList.length).toEqual(MAX_CONTRIBUTORS);

    const { minStake, maxStake, totalStaked } = parseContributorDetails(fullContributorList);

    test('Min stake is 0 when contract is full', () => {
      expect(minStake).toEqual(0n);
    });

    test('Max stake 0 when contract is full', () => {
      expect(maxStake).toEqual(0n);
    });

    test('Total staked is full stake', () => {
      expect(totalStaked).toEqual(FULL_STAKE_AMOUNT);
    });
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

  const contributors = [createContributor(operatorAmount)];

  for (let i = 0; i < numContributors; i++) {
    const { minStake, maxStake } = parseContributorDetails(contributors);
    const amount = getRandomContributorAmount(minStake, maxStake);
    contributors.push(createContributor(amount));
  }
  return contributors;
}

// Needs to be low on CI as GitHub Actions get rate limited quickly
const fuzzAmount = isCI ? 10 : 1000;

describe(`parseContributorDetails fuzzing (fuzzAmount: ${fuzzAmount}`, () => {
  const tests = [];
  const testInfo = [];
  for (let i = 0; i < fuzzAmount; i++) {
    const contributors = createRandomContributorArray();
    let minStake: bigint;
    let totalStaked: bigint;
    try {
      const res = parseContributorDetails(contributors);
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
