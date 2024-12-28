import { SessionStakingClient } from '@session/staking-api-js/client';

export function getRewardsClaimSignature(
  client: SessionStakingClient,
  { address }: { address: string }
) {
  return client.getRewardsClaimSignature({ address });
}
