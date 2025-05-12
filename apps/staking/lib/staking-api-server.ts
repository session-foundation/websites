import 'server-only';

import { NEXT_PUBLIC_BACKEND_API_URL, isProduction } from '@/lib/env';
import { createQueryClient } from '@/lib/query';
import { type StakingBackendQuery, getStakingBackendQueryArgs } from '@/lib/staking-api';
import { createSessionStakingClient } from '@session/staking-api-js/client';

export const createSessionStakingServerClient = () =>
  createSessionStakingClient({
    baseUrl: NEXT_PUBLIC_BACKEND_API_URL,
    debug: !isProduction,
    errorOn404: !isProduction,
  });

export function stakingBackendPrefetchQuery<Q extends StakingBackendQuery>(query: Q) {
  const stakingBackendClient = createSessionStakingServerClient();

  const queryClient = createQueryClient();

  queryClient.prefetchQuery<Awaited<ReturnType<Q>>['data']>({
    ...getStakingBackendQueryArgs(query),
    queryFn: async () => {
      const res = await query(stakingBackendClient);
      return res.data;
    },
  });

  return { queryClient };
}
