'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

type QueryParamValue = string | number | boolean;

export type UseQueryParamsReturn<K = string> = {
  getQueryParams: () => URLSearchParams;
  pushQueryParam: (name: K, value: QueryParamValue) => void;
};

export default function useQueryParams<K = string>(): UseQueryParamsReturn<K> {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getQueryParams = useCallback(() => {
    return new URLSearchParams(decodeURI(searchParams.toString()));
  }, [searchParams]);

  const createQueryString = useCallback(
    (name: K, value: QueryParamValue) => {
      const params = getQueryParams();
      params.set(name as string, String(value));

      return params.toString();
    },
    [getQueryParams]
  );

  const pushQueryParam = useCallback(
    (name: K, value: QueryParamValue) => {
      const str = `${pathname}?${encodeURI(createQueryString(name, value))}`;
      router.push(str);
    },
    [pathname, createQueryString]
  );

  return { getQueryParams, pushQueryParam };
}
