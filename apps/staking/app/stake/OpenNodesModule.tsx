import { getTranslations } from 'next-intl/server';
import { stakingBackendPrefetchQuery } from '@/lib/staking-api-server';
import { getContributionContracts } from '@/lib/queries/getContributionContracts';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import NodesListModule, { NodesListSkeleton } from '@/components/NodesListModule';
import OpenNodes from '@/app/stake/OpenNodes';

export default async function OpenNodesModule() {
  const dictionary = await getTranslations('modules.openNodes');
  const { queryClient } = stakingBackendPrefetchQuery(getContributionContracts);

  return (
    <NodesListModule title={dictionary('title')}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<NodesListSkeleton />}>
          <OpenNodes />
        </Suspense>
      </HydrationBoundary>
    </NodesListModule>
  );
}
