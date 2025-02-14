import { SessionStakingClient } from '@session/staking-api-js/client';

export const getNodeExitSignatures = (
  client: SessionStakingClient,
  { nodePubKey }: { nodePubKey: string }
) => client.getNodeExitSignatures({ nodePubKey });

getNodeExitSignatures.fnName = 'getNodeExitSignatures';
