import type { SessionStakingClient } from '@session/staking-api-js/client';

export const getContributionContractBySnKey = (
  client: SessionStakingClient,
  { nodePubKey }: { nodePubKey: string }
) => client.getContributionContractForNodePubkey({ nodePubKey });

getContributionContractBySnKey.fnName = 'getContributionContractBySnKey';
