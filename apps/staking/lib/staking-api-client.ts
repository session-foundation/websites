'use client';

import { createSessionStakingClient, SessionStakingClient } from '@session/staking-api-js/client';
import {
  getStakingBackendQueryArgs,
  getStakingBackendQueryWithParamsArgs,
  type QueryOptions,
  StakingBackendQuery,
  StakingBackendQueryWithParams,
} from '@/lib/staking-api';
import { isProduction } from '@/lib/env';
import { useMemo } from 'react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { usePreferences } from 'usepref';
import { PREFERENCE, preferenceStorageDefaultItems } from '@/lib/constants';

let client: SessionStakingClient | undefined;

export function useStakingBackendBrowserClient() {
  const { getItem, setItem } = usePreferences();
  let baseUrl = getItem<string>(PREFERENCE.BACKEND_URL);

  if (!baseUrl) {
    const defaultBackendUrl = preferenceStorageDefaultItems[PREFERENCE.BACKEND_URL];
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

export function useStakingBackendSuspenseQuery<Q extends StakingBackendQuery>(query: Q) {
  const stakingBackendClient = useStakingBackendBrowserClient();
  return useSuspenseQuery<Awaited<ReturnType<Q>>['data']>({
    ...getStakingBackendQueryArgs(query),
    queryFn: async () => {
      const res = await query(stakingBackendClient);
      return res.data;
    },
  });
}

export function useStakingBackendQuery<Q extends StakingBackendQuery>(
  query: Q,
  queryOptions?: QueryOptions
) {
  const stakingBackendClient = useStakingBackendBrowserClient();
  return useQuery<Awaited<ReturnType<Q>>['data']>({
    ...getStakingBackendQueryArgs(query),
    ...queryOptions,
    queryFn: async () => {
      const res = await query(stakingBackendClient);
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
      return res.data;
    },
  });
}

export function useStakingBackendQueryWithParams<Q extends StakingBackendQueryWithParams>(
  query: Q,
  params: Parameters<Q>[1],
  queryOptions?: QueryOptions
) {
  const stakingBackendClient = useStakingBackendBrowserClient();
  return useQuery<Awaited<ReturnType<Q>>['data']>({
    ...getStakingBackendQueryWithParamsArgs(query, params),
    ...queryOptions,
    queryFn: async () => {
      const res = await query(stakingBackendClient, params);
      return res.data;
    },
  });
}