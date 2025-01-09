import { useTranslations } from 'next-intl';
import ActionModule from '@/components/ActionModule';
import { BlockExplorerLink, BlockExplorerLinkText } from '@/components/BlockExplorerLink';
import NodeStaking, { NodeStakingFormSkeleton } from './NodeStaking';
import { Suspense, use } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { stakingBackendPrefetchQuery } from '@/lib/staking-api-server';
import { getContributionContracts } from '@/lib/queries/getContributionContracts';

interface NodePageParams {
  params: Promise<{
    address: string;
  }>;
}

export default function NodePage(props: NodePageParams) {
  const params = use(props.params);
  const { address } = params;
  const dictionary = useTranslations('actionModules.node');

  const { queryClient } = stakingBackendPrefetchQuery(getContributionContracts);

  return (
    <ActionModule
      background={3}
      title={dictionary('title')}
      headerAction={
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<BlockExplorerLinkText />}>
            <BlockExplorerLink address={address} />
          </Suspense>
        </HydrationBoundary>
      }
      className="h-screen-without-header md:h-full"
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<NodeStakingFormSkeleton />}>
          <NodeStaking address={address} />
        </Suspense>
      </HydrationBoundary>
    </ActionModule>
  );
}
