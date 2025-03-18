import type { SessionStakingClient } from '@session/staking-api-js/client';

export const getContributionContracts = (client: SessionStakingClient) =>
  client.getContributionContracts();

getContributionContracts.fnName = 'getContributionContracts';
