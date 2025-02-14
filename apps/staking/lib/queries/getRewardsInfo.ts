import { SessionStakingClient } from '@session/staking-api-js/client';

export const getRewardsInfo = (client: SessionStakingClient, { address }: { address: string }) =>
  client.getRewardsInfo({ address });

getRewardsInfo.fnName = 'getRewardsInfo';
