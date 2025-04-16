import type { SessionStakingClient } from '@session/staking-api-js/client';
import { registrationsResponseSchema } from '@session/staking-api-js/schema';
import type { Address } from 'viem';

/**
 * Retrieves the registrations for a given node.
 * @param client The staking backend client.
 * @param address The address of the node.
 * @returns The registrations for the node.
 */
export const getNodeRegistrations = async (
  client: SessionStakingClient,
  { address }: { address: Address }
) => {
  const res = await client.getOperatorRegistrations({ operator: address });
  res.data = registrationsResponseSchema.parse(res.data);
  return res;
};

getNodeRegistrations.fnName = 'getNodeRegistrations';
