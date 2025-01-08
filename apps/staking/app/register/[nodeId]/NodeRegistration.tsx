'use client';

import { NodeRegistrationFormSkeleton } from '@/app/register/[nodeId]/NodeRegistrationForm';
import { Registration } from '@/app/register/[nodeId]/Registration';
import { QUERY } from '@/lib/constants';
import { isProduction } from '@/lib/env';
import { getNodeRegistrations } from '@/lib/queries/getNodeRegistrations';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { areHexesEqual } from '@session/util-crypto/string';
import { useWallet } from '@session/wallet/hooks/useWallet';

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

  const registration =
    registrationsData &&
    'registrations' in registrationsData &&
    Array.isArray(registrationsData.registrations)
      ? registrationsData.registrations.find((node) => areHexesEqual(node.pubkey_ed25519, nodeId))
      : null;

  return isLoadingRegistrations ? (
    <NodeRegistrationFormSkeleton />
  ) : registration ? (
    <Registration
      ed25519PubKey={registration.pubkey_ed25519}
      ed25519Signature={registration.sig_ed25519}
      blsKey={registration.pubkey_bls}
      blsSignature={registration.sig_bls}
      preparedAt={new Date(registration.timestamp * 1000)}
    />
  ) : (
    <span>Not Found</span>
  );
}
