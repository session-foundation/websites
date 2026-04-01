import { NodeContributorList } from '@/components/NodeCard';
import { StakedNodeDataTestId } from '@/testing/data-test-ids';
import { ARBITRUM_EVENT } from '@session/staking-api-js/enums';
import type { Stake } from '@session/staking-api-js/schema';
import { type EthereumAddress, isEthereumAddress } from '@session/util-crypto/keys';
import { useMemo } from 'react';

export type StakeContributorsProps = {
  stake: Stake;
  userAddress?: EthereumAddress;
  forceExpand?: boolean;
};

export function StakeContributors({ stake, userAddress, forceExpand }: StakeContributorsProps) {
  const exitRequestEvent = useMemo(
    () => stake.events.find((event) => event.name === ARBITRUM_EVENT.ServiceNodeExitRequest),
    [stake]
  );

  // TODO: consider adding this info to the backend
  const exitRequestAddress =
    exitRequestEvent?.args &&
    typeof exitRequestEvent.args === 'object' &&
    'initiator' in exitRequestEvent.args &&
    exitRequestEvent.args.initiator &&
    typeof exitRequestEvent.args.initiator === 'string' &&
    isEthereumAddress(exitRequestEvent.args.initiator)
      ? exitRequestEvent.args.initiator
      : undefined;

  return (
    <NodeContributorList
      contributors={stake.contributors}
      userAddress={userAddress}
      operatorAddress={stake.operator_address}
      exitRequestAddress={exitRequestAddress}
      data-testid={StakedNodeDataTestId.Contributor_List}
      forceExpand={forceExpand}
    />
  );
}
