import { SessionStakingClient } from '@session/staking-api-js/client';

export function getNodeExitSignatures(
  client: SessionStakingClient,
  { nodePubKey }: { nodePubKey: string }
) {
  return client.getNodeExitSignatures({ nodePubKey });
}
