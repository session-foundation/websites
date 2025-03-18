import type { SessionStakingClient } from '@session/staking-api-js/client';

export const getRewardsClaimSignature = (
  client: SessionStakingClient,
  { address }: { address: string }
) => client.getRewardsClaimSignature({ address });

getRewardsClaimSignature.fnName = 'getRewardsClaimSignature';
