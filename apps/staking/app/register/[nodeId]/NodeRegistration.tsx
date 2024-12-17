'use client';

import { useMemo } from 'react';
import { useStakingBackendQueryWithParams } from '@/lib/sent-staking-backend-client';
import { getNodeRegistrations } from '@/lib/queries/getNodeRegistrations';
import { QUERY } from '@/lib/constants';
import { notFound } from 'next/navigation';
import { areHexesEqual } from '@session/util-crypto/string';
import { useFeatureFlag } from '@/lib/feature-flags-client';
import { FEATURE_FLAG } from '@/lib/feature-flags';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { isProduction } from '@/lib/env';
import {
  NodeRegistrationForm,
  NodeRegistrationFormSkeleton,
} from '@/app/register/[nodeId]/NodeRegistrationForm';

export default function NodeRegistration({ nodeId }: { nodeId: string }) {
  const showMockRegistration = useFeatureFlag(FEATURE_FLAG.MOCK_REGISTRATION);
  const showOneMockNode = useFeatureFlag(FEATURE_FLAG.MOCK_PENDING_NODES_ONE);
  const showTwoMockNodes = useFeatureFlag(FEATURE_FLAG.MOCK_PENDING_NODES_TWO);
  const showThreeMockNodes = useFeatureFlag(FEATURE_FLAG.MOCK_PENDING_NODES_THREE);
  const showManyMockNodes = useFeatureFlag(FEATURE_FLAG.MOCK_PENDING_NODES_MANY);
  const { address, isConnected } = useWallet();

  const { data: registrationsData, isLoading: isLoadingRegistrations } =
    useStakingBackendQueryWithParams(
      getNodeRegistrations,
      { address: address! },
      {
        enabled: isConnected,
        staleTime: isProduction
          ? QUERY.STALE_TIME_REGISTRATIONS_LIST
          : QUERY.STALE_TIME_REGISTRATIONS_LIST_DEV,
      }
    );

  const node = useMemo(() => {
    if (isLoadingRegistrations) {
      return null;
    }

    if (
      !registrationsData ||
      !('registrations' in registrationsData) ||
      !Array.isArray(registrationsData.registrations)
    ) {
      return null;
    }

    return registrationsData?.registrations.find((node) =>
      areHexesEqual(node.pubkey_ed25519, nodeId)
    );
  }, [
    isLoadingRegistrations,
    registrationsData,
    showMockRegistration,
    showOneMockNode,
    showTwoMockNodes,
    showThreeMockNodes,
    showManyMockNodes,
    nodeId,
  ]);

  return isLoadingRegistrations ? (
    <NodeRegistrationFormSkeleton />
  ) : node ? (
    <NodeRegistrationForm node={node} />
  ) : (
    notFound()
  );
}
