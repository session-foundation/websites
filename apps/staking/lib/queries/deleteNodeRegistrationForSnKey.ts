import type { SessionStakingClient } from '@session/staking-api-js/client';
import { type DeleteRegistrationBody, deleteResponseSchema } from '@session/staking-api-js/schema';

/**
 * Deletes a registration for a given SN key.
 * @param client The staking backend client.
 * @param body Body of the delete request
 * @returns The registrations for the node.
 */
export const deleteNodeRegistrationForSnKey = async (
  client: SessionStakingClient,
  body: DeleteRegistrationBody
) => {
  const res = await client.deleteNodeRegistration(body);
  res.data = deleteResponseSchema.parse(res.data);
  return res;
};

deleteNodeRegistrationForSnKey.fnName = 'deleteNodeRegistrationForSnKey';
