import type { SessionStakingClient } from '@session/staking-api-js/client';
import { contributionContractByKeyResponseSchema } from '@session/staking-api-js/schema';

/**
 * Retrieves the contribution contract for a given SN key.
 * @param client The staking backend client.
 * @param nodePubKey The SN key of the node.
 * @returns The latest contribution contract for the node.
 */
export const getContributionContractBySnKey = async (
  client: SessionStakingClient,
  { nodePubKey }: { nodePubKey: string }
) => {
  const res = await client.getContributionContractForNodePubkey({ nodePubKey });
  res.data = contributionContractByKeyResponseSchema.parse(res.data);
  return res;
};

getContributionContractBySnKey.fnName = 'getContributionContractBySnKey';
