import type { SessionStakingClient } from '@session/staking-api-js/client';
import { CONTRIBUTION_CONTRACT_STATUS } from '@session/staking-api-js/enums';
import { contributionContractResponseSchema } from '@session/staking-api-js/schema';

/**
 * Retrieves the contribution contracts open for public contribution.
 * @param client The staking backend client.
 * @returns An array of contribution contracts.
 */
export const getOpenContributionContracts = async (client: SessionStakingClient) => {
  const res = await client.getContributionContracts({
    statuses: [CONTRIBUTION_CONTRACT_STATUS.OpenForPublicContrib],
  });
  res.data = contributionContractResponseSchema.parse(res.data);
  return res;
};
getOpenContributionContracts.fnName = 'getOpenContributionContracts';
