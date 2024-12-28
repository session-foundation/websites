'use client';

import { useMemo } from 'react';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { getNodeRegistrations } from '@/lib/queries/getNodeRegistrations';
import { NodeRegistrationCard } from '@/components/NodeRegistrationCard';
import { useTranslations } from 'next-intl';
import { QUERY, URL } from '@/lib/constants';
import { isProduction } from '@/lib/env';
import { NodesListSkeleton } from '@/components/NodesListModule';
import { ModuleGridInfoContent } from '@session/ui/components/ModuleGrid';
import { externalLink } from '@/lib/locale-defaults';
import { WalletButtonWithLocales } from '@/components/WalletButtonWithLocales';
import { useFeatureFlag } from '@/lib/feature-flags-client';
import { FEATURE_FLAG } from '@/lib/feature-flags';
import { getStakedNodes } from '@/lib/queries/getStakedNodes';
import { TriangleAlertIcon } from '@session/ui/icons/TriangleAlertIcon';
import { Button } from '@session/ui/ui/button';
import { ButtonDataTestId } from '@/testing/data-test-ids';

export default function NodeRegistrations() {
  const showNoNodes = useFeatureFlag(FEATURE_FLAG.MOCK_NO_PENDING_NODES);

  // TODO: use once we have user preferences
  /* const hideRegistrationsEnabled = useExperimentalFeatureFlag(
     EXPERIMENTAL_FEATURE_FLAG.HIDE_REGISTRATIONS
   );
   const hiddenPreparedRegistrations = useUserPreference('hiddenPreparedRegistrations');
   const forceShowPendingNodesModule = useUserPreference('forceShowPendingNodesModule');

   const [showHidden, setShowHidden] = useState<boolean>(false); */

  const { address, isConnected } = useWallet();

  const {
    data: registrationsData,
    isLoading: isLoadingRegistrations,
    isError,
    refetch,
  } = useStakingBackendQueryWithParams(
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

  const nodes = useMemo(() => {
    if (showNoNodes) {
      return [];
    }

    if (isLoadingRegistrations || isLoadingStakes) {
      return [];
    }

    if (
      !stakesData ||
      ('stakes' in stakesData && Array.isArray(stakesData.stakes) && !stakesData?.stakes?.length)
    ) {
      if (
        registrationsData &&
        'registrations' in registrationsData &&
        Array.isArray(registrationsData.registrations)
      ) {
        return registrationsData.registrations;
      }
      return [];
    }

    const stakedNodeEd25519Pubkeys =
      stakesData && 'stakes' in stakesData && stakesData.stakes && Array.isArray(stakesData.stakes)
        ? stakesData.stakes.map(({ service_node_pubkey }) => service_node_pubkey)
        : [];

    if (
      registrationsData &&
      'registrations' in registrationsData &&
      Array.isArray(registrationsData.registrations)
    ) {
      return registrationsData?.registrations.filter(
        ({ pubkey_ed25519 }) => !stakedNodeEd25519Pubkeys.includes(pubkey_ed25519)
      );
    }

    return [];
  }, [
    isLoadingRegistrations,
    isLoadingStakes,
    registrationsData,
    stakesData,
    address,
    showNoNodes,
  ]);

  return isError ? (
    <ErrorMessage refetch={refetch} />
  ) : address ? (
    isLoadingStakes || isLoadingRegistrations ? (
      <NodesListSkeleton />
    ) : nodes?.length ? (
      nodes.map((node) => <NodeRegistrationCard key={node.pubkey_ed25519} node={node} />)
    ) : (
      <NoNodes />
    )
  ) : (
    <NoWallet />
  );
}

function NoWallet() {
  const dictionary = useTranslations('modules.nodeRegistrations');
  return (
    <ModuleGridInfoContent>
      <p>{dictionary('noWalletP1')}</p>
      <p>
        {dictionary.rich('noNodesP2', { link: externalLink(URL.SESSION_NODE_SOLO_SETUP_DOCS) })}
      </p>
      <WalletButtonWithLocales rounded="md" size="lg" />
    </ModuleGridInfoContent>
  );
}

function NoNodes() {
  const dictionary = useTranslations('modules.nodeRegistrations');
  return (
    <ModuleGridInfoContent>
      <p>{dictionary('noNodesP1')}</p>
      <p>
        {dictionary.rich('noNodesP2', { link: externalLink(URL.SESSION_NODE_SOLO_SETUP_DOCS) })}
      </p>
    </ModuleGridInfoContent>
  );
}

function ErrorMessage({ refetch }: { refetch: () => void }) {
  const dictionary = useTranslations('modules.nodeRegistrations');
  return (
    <ModuleGridInfoContent>
      <TriangleAlertIcon className="stroke-warning h-20 w-20" />
      <p>{dictionary.rich('error')}</p>
      <Button
        data-testid={ButtonDataTestId.Open_Nodes_Error_Retry}
        rounded="md"
        size="lg"
        onClick={refetch}
      >
        {dictionary('errorButton')}
      </Button>
    </ModuleGridInfoContent>
  );
}
