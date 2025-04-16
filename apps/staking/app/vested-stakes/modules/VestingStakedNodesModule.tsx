'use client';

import { StakedNodesWithAddress } from '@/app/mystakes/modules/StakedNodesModule';
import { ErrorBox } from '@/components/Error/ErrorBox';
import { useActiveVestingContractAddress } from '@/providers/vesting-provider';
import { ModuleGridHeader, ModuleGridTitle } from '@session/ui/components/ModuleGrid';
import { useTranslations } from 'next-intl';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';

export default function VestingStakedNodesModule() {
  const address = useActiveVestingContractAddress();
  return (
    <>
      <ModuleGridHeader>
        <ModuleGridTitle>{useTranslations('vesting.modules.stakes')('title')}</ModuleGridTitle>
      </ModuleGridHeader>
      <ErrorBoundary errorComponent={ErrorBox}>
        {address ? <StakedNodesWithAddress address={address} /> : null}
      </ErrorBoundary>
    </>
  );
}
