'use client';

import { NodesListSkeleton } from '@/components/NodesListModule';
import dynamic from 'next/dynamic';

// The browser staking backend client defaults to a relative URL, so its queries can't run on the server.
const OpenNodesClient = dynamic(() => import('./OpenNodes'), {
  ssr: false,
  loading: () => <NodesListSkeleton />,
});

export default OpenNodesClient;
