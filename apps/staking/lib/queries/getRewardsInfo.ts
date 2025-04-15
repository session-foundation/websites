import type { SessionStakingClient } from '@session/staking-api-js/client';
import {
  blsRewardsResponseSchema,
  v1BlsRewardsResponseSchema,
} from '@session/staking-api-js/schema';
import type { Address } from 'viem';

/**
 * Retrieves the rewards info for a given address.
 * @param client The staking backend client.
 * @param address The address of the node.
 * @param v2 Whether to use the v2 rewards endpoint.
 * @returns The rewards info for the node.
 */
export const getRewardsInfo = async (
  client: SessionStakingClient,
  { address, v2 = true }: { address: Address; v2?: boolean }
) => {
  if (!v2) {
    const res = await client.getRewardsInfoV1({ address });
    res.data = v1BlsRewardsResponseSchema.parse(res.data);
    return res;
  }

  const res = await client.getRewardsInfo({ address });
  res.data = blsRewardsResponseSchema.parse(res.data);
  return res;
};

getRewardsInfo.fnName = 'getRewardsInfo';
