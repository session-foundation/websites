import { getContributionContractByAddress } from '@/lib/queries/getContributionContractByAddress';
import { getOpenContributionContracts } from '@/lib/queries/getOpenContributionContracts';
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
        [getContributionContractByAddress.fnName, getOpenContributionContracts.fnName].map((name) =>
          queryClient.invalidateQueries({ queryKey: [name] })
        )
      ),
    [queryClient]
  );
}
