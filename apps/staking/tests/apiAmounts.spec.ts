import { dailyRewardInfo, networkInfoSchema, rewardsInfoSchema } from '@session/staking-api-js/schema';

const network = {
  active_node_count: 1,
  block_hash: 'ab',
  block_height: 2,
  block_timestamp: 3,
  hard_fork: 22,
  immutable_block_hash: 'cd',
  immutable_block_height: 1,
  max_stakers: 10,
  median_operator_fee: 0,
  nettype: 'mainnet',
  node_count: 1,
  pulse_target_timestamp: 4,
  version: '11.0.0',
};

describe('API amounts', () => {
  it('parse from numbers, as the API sends them today', () => {
    const parsed = networkInfoSchema.parse({
      ...network,
      min_operator_contribution: 6_250_000_000_000,
      staking_requirement: 25_000_000_000_000,
    });
    expect(parsed.staking_requirement).toBe(25_000_000_000_000n);
    expect(dailyRewardInfo.parse({ block: 1, lifetime_rewards: 123, timestamp: 2 }).lifetime_rewards).toBe(123n);
  });

  it('parse from strings, which keep amounts above 2^53 exact', () => {
    const parsed = networkInfoSchema.parse({
      ...network,
      min_operator_contribution: '6250000000000',
      staking_requirement: '25000000000000',
    });
    expect(parsed.staking_requirement).toBe(25_000_000_000_000n);
    expect(parsed.min_operator_contribution).toBe(6_250_000_000_000n);

    expect(
      dailyRewardInfo.parse({ block: 1, lifetime_rewards: '22795422631493348102', timestamp: 2 }).lifetime_rewards
    ).toBe(22_795_422_631_493_348_102n);

    const rewards = rewardsInfoSchema.parse({
      amount: '240000000000000000',
      lifetime_liquidated_stakes: '0',
      lifetime_locked_stakes: '0',
      lifetime_rewards: '240000000000000000',
      lifetime_unlocked_stakes: '0',
      locked_stakes: '0',
      timelocked_stakes: '0',
      claimed_stakes: '0',
      claimed_rewards: '0',
    });
    expect(rewards.lifetime_rewards).toBe(240_000_000_000_000_000n);
  });
});
