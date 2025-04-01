'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

type QueryParamValue = string | number | boolean;

export type UseQueryParamsReturn<K = string> = {
  /**
   * Gets the query parameters from the URL.
   * @returns The query parameters.
   */
  getQueryParams: () => URLSearchParams;
  /**
   * Pushes a query parameter to the URL and updates the router.
   * @param name - The name of the query parameter.
   * @param value - The value of the query parameter.
   */
  pushQueryParam: (name: K, value: QueryParamValue) => void;
  /**
   * Clears all query parameters from the URL and pushes the new URL to the router.
   * This is useful for clearing all query parameters when navigating to a new page.
   */
  clearQueryParams: () => void;
};

export default function useQueryParams<K = string>(): UseQueryParamsReturn<K> {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getQueryParams = useCallback(() => {
    return new URLSearchParams(decodeURI(searchParams.toString()));
  }, [searchParams]);

  /**
   * Creates a query string from a name and value.
   * @param name - The name of the query parameter.
   * @param value - The value of the query parameter.
   * @returns The query string.
   */
  const createQueryString = useCallback(
    (name: K, value: QueryParamValue) => {
      const params = getQueryParams();
      params.set(name as string, String(value));

      return params.toString();
    },
    [getQueryParams]
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: router.push here causes an infinite loop
  const pushQueryParam = useCallback(
    (name: K, value: QueryParamValue) => {
      const str = `${pathname}?${encodeURI(createQueryString(name, value))}`;
      router.push(str);
    },
    [pathname, createQueryString]
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: router.push here causes an infinite loop
  const clearQueryParams = useCallback(() => {
    const cleanUrl = pathname.split('?')[0];
    if (cleanUrl) {
      router.push(cleanUrl);
    }
  }, [pathname]);

  return { getQueryParams, pushQueryParam, clearQueryParams };
}
