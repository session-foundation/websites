import type { SessionStakingClient } from '@session/staking-api-js/client';

export const getStakedNodes = (client: SessionStakingClient, { address }: { address: string }) =>
  client.getStakesForWalletAddress({ address });

getStakedNodes.fnName = 'getStakedNodes';
