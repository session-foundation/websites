import type { SessionStakingClient } from '@session/staking-api-js/client';

export const getNodesBlsKeys = (client: SessionStakingClient) => client.getNodesBlsKeys();

getNodesBlsKeys.fnName = 'getNodesBlsKeys';
