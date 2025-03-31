'use client';

import { Registration } from '@/app/register/[nodeId]/Registration';
import { useStakes } from '@/hooks/useStakes';
import { areHexesEqual } from '@session/util-crypto/string';
import { useCallback, useEffect, useMemo } from 'react';

import { NodeRegistrationFormSkeleton } from '@/app/register/[nodeId]/NodeRegistrationFormSkeleton';
import { useRegistrationsForCurrentActor } from '@/hooks/useRegistrationsForCurrentActor';
import { useStakingBackendBrowserClient } from '@/lib/staking-api-client';
import { useTranslations } from 'next-intl';

export default function NodeRegistration({ nodeId }: { nodeId: string }) {

  const { data: registrationsData, isLoading: isLoadingRegistrations } =
    useRegistrationsForCurrentActor();
  const dict = useTranslations('actionModules.registration.shared');

  const { isLoading: isLoadingStakes } = useStakes();

  const registration = useMemo(
    () =>
      registrationsData &&
      'registrations' in registrationsData &&
      Array.isArray(registrationsData.registrations)
        ? registrationsData.registrations.find((node) => areHexesEqual(node.pubkey_ed25519, nodeId))
        : null,
    [registrationsData, nodeId]
  );

  return isLoadingRegistrations || isLoadingStakes ? (
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
    <span>{dict('nodeNotFound')}</span>
  );
}
