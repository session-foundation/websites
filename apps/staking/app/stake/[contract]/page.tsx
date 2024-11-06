import { useTranslations } from 'next-intl';
import ActionModule from '@/components/ActionModule';
import { BlockExplorerLink, BlockExplorerLinkText } from '@/components/BlockExplorerLink';
import NodeStaking, { NodeStakingFormSkeleton } from './NodeStaking';
import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { stakingBackendPrefetchQuery } from '@/lib/sent-staking-backend-server';
import { getOpenNodes } from '@/lib/queries/getOpenNodes';

interface NodePageParams {
  params: {
    contract: string;
  };
}

export default function NodePage({ params }: NodePageParams) {
  const { contract } = params;
  const dictionary = useTranslations('actionModules.node');

  const { queryClient } = stakingBackendPrefetchQuery(getOpenNodes);

  return (
    <ActionModule
      background={3}
      title={dictionary('title')}
      headerAction={
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<BlockExplorerLinkText />}>
            <BlockExplorerLink contract={contract} />
          </Suspense>
        </HydrationBoundary>
      }
      className="h-screen-without-header md:h-full"
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<NodeStakingFormSkeleton />}>
          <NodeStaking contract={contract} />
        </Suspense>
      </HydrationBoundary>
    </ActionModule>
  );
}
