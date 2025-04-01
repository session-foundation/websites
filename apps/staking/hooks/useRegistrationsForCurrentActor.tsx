import { useCurrentActor } from '@/hooks/useCurrentActor';
import { QUERY } from '@/lib/constants';
import { isProduction } from '@/lib/env';
import { getNodeRegistrations } from '@/lib/queries/getNodeRegistrations';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';

/**
 * Hook to get the registrations for the current actor. @see {@link useCurrentActor}
 * @returns The registrations for the current actor.
 */
export const useRegistrationsForCurrentActor = () => {
  const address = useCurrentActor();
  return useStakingBackendQueryWithParams(
    getNodeRegistrations,
    { address: address! },
    {
      enabled: !!address,
      staleTime: isProduction
        ? QUERY.STALE_TIME_REGISTRATIONS_LIST
        : QUERY.STALE_TIME_REGISTRATIONS_LIST_DEV,
    }
  );
};
