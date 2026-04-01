import type { SessionStakingClient } from '@session/staking-api-js/client';

export const getHardForkInfo = (client: SessionStakingClient) => client.getHardForkInfo();

getHardForkInfo.fnName = 'getHardForkInfo';
