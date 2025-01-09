import { SessionStakingClient } from '@session/staking-api-js/client';

export function getStakedNodes(client: SessionStakingClient, { address }: { address: string }) {
  return client.getStakesForWalletAddress({ address });
}
