import { SessionStakingClient } from '@session/staking-api-js/client';

export const getNodes = (client: SessionStakingClient) => client.getNodes();

getNodes.fnName = 'getNodes';
