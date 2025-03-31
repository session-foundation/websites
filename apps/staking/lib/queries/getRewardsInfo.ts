import type { SessionStakingClient } from '@session/staking-api-js/client';
import { blsRewardsResponseSchema } from '@session/staking-api-js/schema';
import type { Address } from 'viem';

/**
 * Retrieves the rewards info for a given address.
 * @param client The staking backend client.
 * @param address The address of the node.
 * @returns The rewards info for the node.
 */
export const getRewardsInfo = async (
  client: SessionStakingClient,
  { address }: { address: Address }
) => {
  const res = await client.getRewardsInfo({ address });
  res.data = blsRewardsResponseSchema.parse(res.data);
  return res;
};

getRewardsInfo.fnName = 'getRewardsInfo';
