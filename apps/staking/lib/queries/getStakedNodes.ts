import type { SessionStakingClient } from '@session/staking-api-js/client';
import { stakesResponseSchema } from '@session/staking-api-js/schema';

/**
 * Retrieves the stakes for a given address.
 * @param client The staking backend client.
 * @param address The address of the node.
 * @returns The stakes for the node.
 */
export const getStakedNodes = async (
  client: SessionStakingClient,
  { address }: { address: string }
) => {
  const res = await client.getStakesForWalletAddress({ address });
  res.data = stakesResponseSchema.parse(res.data);
  return res;
};

getStakedNodes.fnName = 'getStakedNodes';
