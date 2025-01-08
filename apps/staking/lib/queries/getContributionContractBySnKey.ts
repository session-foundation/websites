import type { SessionStakingClient } from '@session/staking-api-js/client';

export function getContributionContractBySnKey(
  client: SessionStakingClient,
  { nodePubKey }: { nodePubKey: string }
) {
  return client.getContributionContractForNodePubkey({ nodePubKey });
}
