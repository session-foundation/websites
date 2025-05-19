import type { SessionStakingClient } from '@session/staking-api-js/client';
import { dailyRewardsResponseSchema } from '@session/staking-api-js/schema';
import type { Address } from 'viem';

/**
 * Retrieves the daily rewards for a given address.
 * @param client The staking backend client.
 * @param address The address of the node.
 * @returns The daily rewards for the node.
 */
export const getDailyRewards = async (
  client: SessionStakingClient,
  { address }: { address: Address }
) => {
  const res = await client.getDailyRewardsInfo({ address });
  res.data = dailyRewardsResponseSchema.parse(res.data);
  return res;
};

getDailyRewards.fnName = 'getDailyRewards';
