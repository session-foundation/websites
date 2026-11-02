import { getContributionContracts } from '@/lib/queries/getContributionContracts';
import { getOpenContributionContracts } from '@/lib/queries/getOpenContributionContracts';
import { getStakingBackendQueryArgs } from '@/lib/staking-api';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * The open nodes list and the staking form cache the contracts separately; refresh both together.
 * Only queries currently on screen are refetched.
 */
export function useRefetchContributionContracts() {
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      Promise.all(
        [getContributionContracts, getOpenContributionContracts].map((query) =>
          queryClient.invalidateQueries(getStakingBackendQueryArgs(query))
        )
      ),
    [queryClient]
  );
}
