import { getNodeRegistrations } from '@/lib/queries/getNodeRegistrations';
import type { SessionStakingClient } from '@session/staking-api-js/client';
import { registrationsResponseSchema } from '@session/staking-api-js/schema';
import type { Ed25519PublicKey } from '@session/util-crypto/keys';

/**
 * Retrieves the registrations for a given SN key.
 * @param client The staking backend client.
 * @param snKey The SN key of the node.
 * @returns The registrations for the node.
 */
export const getNodeRegistrationsForSnKey = async (
  client: SessionStakingClient,
  { snKey }: { snKey: Ed25519PublicKey }
) => {
  const res = await client.getOperatorRegistrations({ operator: snKey });
  res.data = registrationsResponseSchema.parse(res.data);
  return res;
};

getNodeRegistrations.fnName = 'getNodeRegistrationsForSnKey';
