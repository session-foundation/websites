'use client';

import { isOpenNodeContributor, isOpenNodeOperator, OpenNodeCard } from '@/components/OpenNodeCard';
import { URL } from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import { ModuleGridInfoContent } from '@session/ui/components/ModuleGrid';
import { useTranslations } from 'next-intl';
import { useStakingBackendSuspenseQuery } from '@/lib/sent-staking-backend-client';
import { getOpenNodes } from '@/lib/queries/getOpenNodes';
import { NodesListSkeleton } from '@/components/NodesListModule';
import { useMemo } from 'react';
import type { OpenNode } from '@session/sent-staking-js/client';
import { useWallet } from '@session/wallet/hooks/wallet-hooks';
import type { Address } from 'viem';

export const sortAndGroupOpenNodes = (nodes: Array<OpenNode>, address?: Address) => {
  nodes.sort((a, b) => {
    if (a.fee === b.fee) return b.total_contributions - a.total_contributions;
    return a.fee - b.fee;
  });
  const operatorNotStaked = [];
  const operator = [];
  const staked = [];
  const other = [];

  for (const node of nodes) {
    const isOperator = isOpenNodeOperator(node, address);
    if (node.total_contributions === 0) {
      if (isOperator) operatorNotStaked.push(node);
    } else if (isOperator) operator.push(node);
    else if (isOpenNodeContributor(node, address)) staked.push(node);
    else other.push(node);
  }

  return [operatorNotStaked, operator, staked, other].flat(1);
};

export default function OpenNodes() {
  const { data, isLoading } = useStakingBackendSuspenseQuery(getOpenNodes);
  const { address } = useWallet();

  const nodes = useMemo(
    () => (data?.nodes?.length ? sortAndGroupOpenNodes(data.nodes, address) : []),
    [data]
  );

  return isLoading ? (
    <NodesListSkeleton />
  ) : nodes.length ? (
    nodes.map((node) => <OpenNodeCard key={node.contract} node={node} />)
  ) : (
    <NoNodes />
  );
}

function NoNodes() {
  const dictionary = useTranslations('modules.openNodes');
  return (
    <ModuleGridInfoContent>
      <p>{dictionary('noNodesP1')}</p>
      <p>{dictionary.rich('noNodesP2', { link: externalLink(URL.SESSION_NODE_DOCS) })}</p>
    </ModuleGridInfoContent>
  );
}
