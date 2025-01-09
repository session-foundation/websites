import { SessionStakingClient } from '@session/staking-api-js/client';

export async function getNodesBlsKeys(client: SessionStakingClient) {
  return client.getNodesBlsKeys();
}
