import type { SessionStakingClient } from '@session/staking-api-js/client';
import { blsExitSignatureResponseSchema } from '@session/staking-api-js/schema';

/**
 * Retrieves the BLS exit signatures for a given node.
 * @param client The staking backend client.
 * @param nodePubKey The SN key of the node.
 * @returns The BLS exit signatures for the node.
 */
export const getNodeExitSignatures = async (
  client: SessionStakingClient,
  { nodePubKey }: { nodePubKey: string }
) => {
  const res = await client.getNodeExitSignatures({ nodePubKey });
  res.data = blsExitSignatureResponseSchema.parse(res.data);
  return res;
};

getNodeExitSignatures.fnName = 'getNodeExitSignatures';
