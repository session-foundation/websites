'use client';

import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { getNodeRegistrations } from '@/lib/queries/getNodeRegistrations';
import { QUERY } from '@/lib/constants';
import { areHexesEqual } from '@session/util-crypto/string';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { isProduction } from '@/lib/env';
import {
  NodeRegistrationForm,
  NodeRegistrationFormSkeleton,
} from '@/app/register/[nodeId]/NodeRegistrationForm';

export default function NodeRegistration({ nodeId }: { nodeId: string }) {
  const { address } = useWallet();

  const { data: registrationsData, isLoading: isLoadingRegistrations } =
    useStakingBackendQueryWithParams(
      getNodeRegistrations,
      { address: address! },
      {
        enabled: !!address,
        staleTime: isProduction
          ? QUERY.STALE_TIME_REGISTRATIONS_LIST
          : QUERY.STALE_TIME_REGISTRATIONS_LIST_DEV,
      }
    );

  const node =
    registrationsData &&
    'registrations' in registrationsData &&
    Array.isArray(registrationsData.registrations)
      ? registrationsData.registrations.find((node) => areHexesEqual(node.pubkey_ed25519, nodeId))
      : null;

  return isLoadingRegistrations ? (
    <NodeRegistrationFormSkeleton />
  ) : node ? (
    <NodeRegistrationForm node={node} />
  ) : (
    // <Registration
    //   ed25519PubKey={node.pubkey_ed25519}
    //   blsKey={node.pubkey_bls}
    //   preparedAt={new Date(node.timestamp * 1000)}
    // />
    <span>Not Found</span>
  );
}
