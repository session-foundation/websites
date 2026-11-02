import OpenNodesClient from '@/app/stake/OpenNodesClient';
import { ErrorBox } from '@/components/Error/ErrorBox';
import NodesListModule, { NodesListSkeleton } from '@/components/NodesListModule';
import { getTranslations } from 'next-intl/server';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import { Suspense } from 'react';

export default async function OpenNodesModule() {
  const dictionary = await getTranslations('modules.openNodes');

  return (
    <NodesListModule title={dictionary('title')}>
      <Suspense fallback={<NodesListSkeleton />}>
        <ErrorBoundary errorComponent={ErrorBox}>
          <OpenNodesClient />
        </ErrorBoundary>
      </Suspense>
    </NodesListModule>
  );
}
