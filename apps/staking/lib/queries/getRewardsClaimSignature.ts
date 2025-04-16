import type { SessionStakingClient } from '@session/staking-api-js/client';
import { blsRewardsSignatureResponseSchema } from '@session/staking-api-js/schema';
import type { Address } from 'viem';

/**
 * Get the BLS rewards signature for a given address.
 * This signature can be submitted to the sn rewards contract to update the caller wallet's
 * rewards balance. After this the wallet can claim their rewards.
 * @param client ssb client
 * @param address wallet address
 * @returns BLS rewards signature details
 */
export const getRewardsClaimSignature = async (
  client: SessionStakingClient,
  { address }: { address: Address }
) => {
  const res = await client.getRewardsClaimSignature({ address });
  res.data = blsRewardsSignatureResponseSchema.parse(res.data);
  return res;
};

getRewardsClaimSignature.fnName = 'getRewardsClaimSignature';
