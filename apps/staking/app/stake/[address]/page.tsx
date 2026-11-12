import ActionModule from '@/components/ActionModule';
import {
  ArbitrumBlockExplorerLink,
  ArbitrumBlockExplorerLinkText,
} from '@/components/ArbitrumBlockExplorerLink';
import { MODULE_GRID_ALIGNMENT } from '@session/ui/components/ModuleGrid';
import { LoadingText } from '@session/ui/components/loading-text';
import { Suspense, use } from 'react';
import { NodeStakingFormSkeleton } from './Staking';
import { StakingActionModuleTitleClient, StakingClient } from './StakingClient';

interface NodePageParams {
  params: Promise<{
    address: string;
  }>;
}

export default function NodePage(props: NodePageParams) {
  const params = use(props.params);
  const { address } = params;

  return (
    <ActionModule
      background={3}
      title={
        <Suspense fallback={<LoadingText />}>
          <StakingActionModuleTitleClient address={address} />
        </Suspense>
      }
      contentAlignment={MODULE_GRID_ALIGNMENT.TOP}
      headerAction={
        <Suspense fallback={<ArbitrumBlockExplorerLinkText />}>
          <ArbitrumBlockExplorerLink address={address} />
        </Suspense>
      }
    >
      <Suspense fallback={<NodeStakingFormSkeleton />}>
        <StakingClient address={address} />
      </Suspense>
    </ActionModule>
  );
}
