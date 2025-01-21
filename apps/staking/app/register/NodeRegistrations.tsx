'use client';

import { NodeRegistrationCard } from '@/components/NodeRegistrationCard';
import { NodesListSkeleton } from '@/components/NodesListModule';
import { WalletButtonWithLocales } from '@/components/WalletButtonWithLocales';
import { QUERY, URL } from '@/lib/constants';
import { isProduction } from '@/lib/env';
import { FEATURE_FLAG } from '@/lib/feature-flags';
import { useFeatureFlag } from '@/lib/feature-flags-client';
import { externalLink } from '@/lib/locale-defaults';
import { getNodeRegistrations } from '@/lib/queries/getNodeRegistrations';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { ModuleGridInfoContent } from '@session/ui/components/ModuleGrid';
import { TriangleAlertIcon } from '@session/ui/icons/TriangleAlertIcon';
import { Button } from '@session/ui/ui/button';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useStakes } from '@/hooks/useStakes';

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

  const { data, isLoading, isError, refetch } = useStakingBackendQueryWithParams(
    getNodeRegistrations,
    { address: address! },
    {
      enabled: isConnected,
      staleTime: isProduction
        ? QUERY.STALE_TIME_REGISTRATIONS_LIST
        : QUERY.STALE_TIME_REGISTRATIONS_LIST_DEV,
    }
  );

  const { addedBlsKeys, isLoading: isLoadingStakes } = useStakes();

  const nodes = useMemo(() => {
    if (
      showNoNodes ||
      !data ||
      !('registrations' in data) ||
      !Array.isArray(data.registrations) ||
      isLoadingStakes ||
      !addedBlsKeys
    ) {
      return [];
    }

    return data.registrations.filter(({ pubkey_bls }) => !addedBlsKeys.has(pubkey_bls));
  }, [addedBlsKeys, data, showNoNodes, isLoadingStakes]);

  return isError ? (
    <ErrorMessage refetch={refetch} />
  ) : address ? (
    isLoading || isLoadingStakes ? (
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
