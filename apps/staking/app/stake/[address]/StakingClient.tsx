'use client';

import { LoadingText } from '@session/ui/components/loading-text';
import dynamic from 'next/dynamic';
import { NodeStakingFormSkeleton } from './Staking';

// The browser staking backend client defaults to a relative URL, so its queries can't run on the server.
export const StakingActionModuleTitleClient = dynamic(
  () => import('./Staking').then((mod) => mod.StakingActionModuleTitle),
  { ssr: false, loading: () => <LoadingText /> }
);

export const StakingClient = dynamic(() => import('./Staking'), {
  ssr: false,
  loading: () => <NodeStakingFormSkeleton />,
});
