import { QUERY } from '@/lib/constants';
import { isProduction } from '@/lib/env';
import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: isProduction ? QUERY.STALE_TIME_DEFAULT : QUERY.STALE_TIME_DEFAULT_DEV,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  });
}

export enum QUERY_STATUS {
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}
