import type { SessionStakingClient, StakingBackendResponse } from '@session/staking-api-js/client';

export type StakingBackendQuery = (
  stakingBackendClient: SessionStakingClient
) => Promise<StakingBackendResponse<unknown>>;

export type StakingBackendQueryWithParams = (
  stakingBackendClient: SessionStakingClient,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: resolve proper type
  params: any
) => Promise<StakingBackendResponse<unknown>>;

export function getStakingBackendQueryArgs<Q extends StakingBackendQuery>(query: Q) {
  return {
    queryKey: [query.name],
  };
}

/**
 * Creates a query key for a Staking Backend query with params.
 *
 * NOTE: This function assumes that the query has a `fnName` property. All queries should have a
 * `fnName` property. If a query function does not have a `fnName` property, an error will be
 * logged and the function name will be used as the query key.
 *
 * NOTE: `fn.name` is not an appropriate query key because js functions get minified by webpack to
 * a single character in most cases. This leads to query key collisions.
 *
 * @param query The query to create a key for.
 * @param params The params for the query.
 * @returns The query key.
 */
export function getStakingBackendQueryWithParamsArgs<Q extends StakingBackendQueryWithParams>(
  query: Q,
  params: Parameters<Q>[1]
) {
  const name = 'fnName' in query ? query.fnName : null;

  if (!name) console.error(`No fnName found for query ${query}`);

  return {
    queryKey: [name ?? query.name, params],
  };
}
