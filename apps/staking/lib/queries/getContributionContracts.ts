import type { SessionStakingClient } from '@session/staking-api-js/client';
import { contributionContractResponseSchema } from '@session/staking-api-js/schema';

/**
 * Retrieves all contribution contracts.
 * @param client The staking backend client.
 * @returns An array of contribution contracts.
 */
export const getContributionContracts = async (client: SessionStakingClient) => {
  const res = await client.getContributionContracts();
  res.data = contributionContractResponseSchema.parse(res.data);
  return res;
};
getContributionContracts.fnName = 'getContributionContracts';
