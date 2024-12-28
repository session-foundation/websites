import { SessionStakingClient } from '@session/staking-api-js/client';

export function getContributionContracts(client: SessionStakingClient) {
  return client.getContributionContracts();
}
