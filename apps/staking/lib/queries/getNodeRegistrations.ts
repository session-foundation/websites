import { SessionStakingClient } from '@session/staking-api-js/client';

export async function getNodeRegistrations(
  client: SessionStakingClient,
  { address }: { address: string }
) {
  return client.getOperatorRegistrations({ operator: address });
}
