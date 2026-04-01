import type { SessionStakingClient } from '@session/staking-api-js/client';

export const getContractNodes = (client: SessionStakingClient) => client.getContractNodes();

getContractNodes.fnName = 'getContractNodes';
