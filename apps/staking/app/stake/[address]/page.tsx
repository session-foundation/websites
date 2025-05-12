import ActionModule from '@/components/ActionModule';
import {
  ArbitrumBlockExplorerLink,
  ArbitrumBlockExplorerLinkText,
} from '@/components/ArbitrumBlockExplorerLink';
import { getContributionContracts } from '@/lib/queries/getContributionContracts';
import { stakingBackendPrefetchQuery } from '@/lib/staking-api-server';
import { MODULE_GRID_ALIGNMENT } from '@session/ui/components/ModuleGrid';
import { LoadingText } from '@session/ui/components/loading-text';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense, use } from 'react';
import Staking, { NodeStakingFormSkeleton, StakingActionModuleTitle } from './Staking';

interface NodePageParams {
  params: Promise<{
    address: string;
  }>;
}

export default function NodePage(props: NodePageParams) {
  const params = use(props.params);
  const { address } = params;

  const { queryClient } = stakingBackendPrefetchQuery(getContributionContracts);

  return (
    <ActionModule
      background={3}
      title={
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<LoadingText />}>
            <StakingActionModuleTitle address={address} />
          </Suspense>
        </HydrationBoundary>
      }
      contentAlignment={MODULE_GRID_ALIGNMENT.TOP}
      headerAction={
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<ArbitrumBlockExplorerLinkText />}>
            <ArbitrumBlockExplorerLink address={address} />
          </Suspense>
        </HydrationBoundary>
      }
      className="h-screen-without-header md:h-full"
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<NodeStakingFormSkeleton />}>
          <Staking address={address} />
        </Suspense>
      </HydrationBoundary>
    </ActionModule>
  );
}
