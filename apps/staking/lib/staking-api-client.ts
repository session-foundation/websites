'use client';

import { PREFERENCE, prefDetails } from '@/lib/constants';
import { isProduction } from '@/lib/env';
import logger from '@/lib/logger';
import {
  type StakingBackendQuery,
  type StakingBackendQueryWithParams,
  getStakingBackendQueryArgs,
  getStakingBackendQueryWithParamsArgs,
} from '@/lib/staking-api';
import {
  type SessionStakingClient,
  createSessionStakingClient,
} from '@session/staking-api-js/client';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { usePreferences } from 'usepref';

export type QueryOptions<Q extends StakingBackendQueryWithParams> = Omit<
  Parameters<typeof useQuery<Awaited<ReturnType<Q>>['data']>>[0],
  'queryFn' | 'queryKey'
>;

export type MutationQueryOptions<Q extends StakingBackendQueryWithParams> = Omit<
  Parameters<typeof useMutation<Awaited<ReturnType<Q>>['data']>>[0],
  'mutationFn'
>;

let client: SessionStakingClient | undefined;

function debugLogRequest(response: Awaited<ReturnType<StakingBackendQueryWithParams>>) {
  logger.debug(`SSB Response: ${response.status} ${response.statusText}`);
  logger.debug(response.data);
}

export function useStakingBackendBrowserClient() {
  const { getItem, setItem } = usePreferences();
  let baseUrl = getItem<string>(PREFERENCE.BACKEND_URL);

  if (!baseUrl) {
    const defaultBackendUrl = prefDetails[PREFERENCE.BACKEND_URL].defaultValue;
    setItem(PREFERENCE.BACKEND_URL, defaultBackendUrl);
    baseUrl = defaultBackendUrl;
  }

  return useMemo(() => {
    if (!client || client.baseUrl !== baseUrl) {
      client = createSessionStakingClient({
        baseUrl,
        debug: !isProduction,
        errorOn404: !isProduction,
      });
    }

    return client;
  }, [baseUrl]);
}

export function useStakingBackendSuspenseQuery<Q extends StakingBackendQuery>(
  query: Q,
  queryOptions?: QueryOptions<Q>
) {
  const stakingBackendClient = useStakingBackendBrowserClient();
  return useSuspenseQuery<Awaited<ReturnType<Q>>['data']>({
    ...getStakingBackendQueryArgs(query),
    ...queryOptions,
    queryFn: async () => {
      const res = await query(stakingBackendClient);
      debugLogRequest(res);
      return res.data;
    },
  });
}

export function useStakingBackendQuery<Q extends StakingBackendQuery>(
  query: Q,
  queryOptions?: QueryOptions<Q>
) {
  const stakingBackendClient = useStakingBackendBrowserClient();
  return useQuery<Awaited<ReturnType<Q>>['data']>({
    ...getStakingBackendQueryArgs(query),
    ...queryOptions,
    queryFn: async () => {
      const res = await query(stakingBackendClient);
      debugLogRequest(res);
      return res.data;
    },
  });
}

export function useStakingBackendSuspenseQueryWithParams<Q extends StakingBackendQueryWithParams>(
  query: Q,
  params: Parameters<Q>[1]
) {
  const stakingBackendClient = useStakingBackendBrowserClient();
  return useSuspenseQuery<Awaited<ReturnType<Q>>['data']>({
    ...getStakingBackendQueryWithParamsArgs(query, params),
    queryFn: async () => {
      const res = await query(stakingBackendClient, params);
      debugLogRequest(res);
      return res.data;
    },
  });
}

export function useStakingBackendQueryWithParams<Q extends StakingBackendQueryWithParams>(
  query: Q,
  params: Parameters<Q>[1],
  queryOptions?: QueryOptions<Q>
) {
  const stakingBackendClient = useStakingBackendBrowserClient();
  return useQuery<Awaited<ReturnType<Q>>['data']>({
    ...getStakingBackendQueryWithParamsArgs(query, params),
    ...queryOptions,
    queryFn: async () => {
      const res = await query(stakingBackendClient, params);
      debugLogRequest(res);
      return res.data;
    },
  });
}

export function useStakingBackendMutationQueryWithParams<Q extends StakingBackendQueryWithParams>(
  query: Q,
  queryOptions?: MutationQueryOptions<Q>
) {
  const stakingBackendClient = useStakingBackendBrowserClient();
  return useMutation<Parameters<Q>[1]>({
    ...queryOptions,
    mutationFn: async (params: Parameters<Q>[1]) => {
      const res = await query(stakingBackendClient, params);
      debugLogRequest(res);
      return res.data;
    },
  });
}
