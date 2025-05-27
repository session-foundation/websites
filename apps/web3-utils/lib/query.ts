import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
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
