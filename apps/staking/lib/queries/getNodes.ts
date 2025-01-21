import { SessionStakingClient } from '@session/staking-api-js/client';

export async function getNodes(client: SessionStakingClient) {
  return client.getNodes();
}
