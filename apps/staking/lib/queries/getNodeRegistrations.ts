import type { SessionStakingClient } from '@session/staking-api-js/client';

export const getNodeRegistrations = (
  client: SessionStakingClient,
  { address }: { address: string }
) => client.getOperatorRegistrations({ operator: address });

getNodeRegistrations.fnName = 'getNodeRegistrations';
