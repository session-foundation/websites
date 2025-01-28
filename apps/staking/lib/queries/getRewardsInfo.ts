import { SessionStakingClient } from '@session/staking-api-js/client';

export function getRewardsInfo(client: SessionStakingClient, { address }: { address: string }) {
  return client.getRewardsInfo({ address });
}
