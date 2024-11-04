'use client';

import { useMemo } from 'react';
import { useStakingBackendQueryWithParams } from '@/lib/sent-staking-backend-client';
import { getNodeRegistrations } from '@/lib/queries/getNodeRegistrations';
import { QUERY } from '@/lib/constants';
import { notFound } from 'next/navigation';
import { generateMockRegistrations } from '@session/sent-staking-js/test';
import { areHexesEqual } from '@session/util-crypto/string';
import { useFeatureFlag } from '@/lib/feature-flags-client';
import { FEATURE_FLAG } from '@/lib/feature-flags';
import { useWallet } from '@session/wallet/hooks/wallet-hooks';
import { isProduction } from '@/lib/env';
import { getStakedNodes } from '@/lib/queries/getStakedNodes';
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

  const { data: stakesData, isLoading: isLoadingStakes } = useStakingBackendQueryWithParams(
    getStakedNodes,
    { address: address! },
    {
      enabled: isConnected,
      staleTime: isProduction
        ? QUERY.STALE_TIME_REGISTRATIONS_LIST
        : QUERY.STALE_TIME_REGISTRATIONS_LIST_DEV,
    }
  );

  const node = useMemo(() => {
    if (
      showMockRegistration ||
      showOneMockNode ||
      showTwoMockNodes ||
      showThreeMockNodes ||
      showManyMockNodes
    ) {
      return generateMockRegistrations({ userAddress: address!, numberOfNodes: 1 })[0];
    }

    if (isLoadingRegistrations || isLoadingStakes) {
      return null;
    }

    const stakedNodeEd25519Pubkeys = stakesData?.stakes.map(
      ({ service_node_pubkey }) => service_node_pubkey
    );

    return registrationsData?.registrations
      .filter(({ pubkey_ed25519 }) => !stakedNodeEd25519Pubkeys?.includes(pubkey_ed25519))
      .find((node) => areHexesEqual(node.pubkey_ed25519, nodeId));
  }, [
    isLoadingRegistrations,
    isLoadingStakes,
    registrationsData?.registrations,
    stakesData?.stakes,
    showMockRegistration,
    showOneMockNode,
    showTwoMockNodes,
    showThreeMockNodes,
    showManyMockNodes,
    nodeId,
  ]);

  return isLoadingRegistrations || isLoadingStakes ? (
    <NodeRegistrationFormSkeleton />
  ) : node ? (
    <NodeRegistrationForm node={node} />
  ) : (
    notFound()
  );
}
