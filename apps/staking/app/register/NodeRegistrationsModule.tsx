import NodeRegistrations from '@/app/register/NodeRegistrations';
import { ErrorBox } from '@/components/Error/ErrorBox';
import NodesListModule, { NodesListSkeleton } from '@/components/NodesListModule';
import { getTranslations } from 'next-intl/server';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import { Suspense } from 'react';

export default async function NodeRegistrationsModule() {
  const dictionary = await getTranslations('modules.nodeRegistrations');

  return (
    <NodesListModule title={dictionary('title')}>
      <Suspense fallback={<NodesListSkeleton />}>
        <ErrorBoundary errorComponent={ErrorBox}>
          <NodeRegistrations />
        </ErrorBoundary>
      </Suspense>
    </NodesListModule>
  );
}
