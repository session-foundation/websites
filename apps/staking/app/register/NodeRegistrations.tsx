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
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';
import { useStakes } from '@/hooks/useStakes';
import type { Registration } from '@session/staking-api-js/client';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useNetworkStatus } from '@/components/StatusBar';

export default function NodeRegistrations() {
  const dictionary = useTranslations('modules.nodeRegistrations');
  const showNoNodes = useFeatureFlag(FEATURE_FLAG.MOCK_NO_PENDING_NODES);

  // TODO: use once we have user preferences
  /* const hideRegistrationsEnabled = useExperimentalFeatureFlag(
     EXPERIMENTAL_FEATURE_FLAG.HIDE_REGISTRATIONS
   );
   const hiddenPreparedRegistrations = useUserPreference('hiddenPreparedRegistrations');
   const forceShowPendingNodesModule = useUserPreference('forceShowPendingNodesModule');

   const [showHidden, setShowHidden] = useState<boolean>(false); */

  const { address, isConnected } = useWallet();

  const { data, isLoading, isError, refetch, isFetching } = useStakingBackendQueryWithParams(
    getNodeRegistrations,
    { address: address! },
    {
      enabled: isConnected,
      staleTime: isProduction
        ? QUERY.STALE_TIME_REGISTRATIONS_LIST
        : QUERY.STALE_TIME_REGISTRATIONS_LIST_DEV,
    }
  );

  const network = useMemo(
    () => (data && 'network' in data && data.network ? data.network : null),
    [data]
  );

  const { setNetworkStatusVisible } = useNetworkStatus({ network, isLoading, isFetching, refetch });

  const { addedBlsKeys, isLoading: isLoadingStakes } = useStakes();

  /**
   * - Sorted in descending order by the `timestamp` of the registration.
   * - Remove registrations that have bls keys already in the smart contract.
   * - Remove duplicate registrations, keeping only the most recent.
   */
  const registrations = useMemo(() => {
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

    const addedRegistrationBlsKeys = new Set();

    return (data.registrations as Array<Registration>)
      .sort(({ timestamp: tA }, { timestamp: tB }) => tB - tA)
      .filter(({ pubkey_bls }) => {
        if (!addedBlsKeys.has(pubkey_bls) && !addedRegistrationBlsKeys.has(pubkey_bls)) {
          addedRegistrationBlsKeys.add(pubkey_bls);
          return true;
        }
        return false;
      });
  }, [addedBlsKeys, data, showNoNodes, isLoadingStakes]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: On mount
  useEffect(() => {
    if (isConnected) {
      setNetworkStatusVisible(true);
    }
    return () => {
      setNetworkStatusVisible(false);
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: On connected state change
  useEffect(() => {
    setNetworkStatusVisible(isConnected);
    return () => {
      setNetworkStatusVisible(false);
    };
  }, [isConnected]);

  return isError ? (
    <ErrorMessage
      refetch={refetch}
      message={dictionary.rich('error')}
      buttonText={dictionary('errorButton')}
      buttonDataTestId={ButtonDataTestId.Open_Nodes_Error_Retry}
    />
  ) : address ? (
    isLoading || isLoadingStakes ? (
      <NodesListSkeleton />
    ) : registrations?.length ? (
      registrations.map((node) => <NodeRegistrationCard key={node.pubkey_ed25519} node={node} />)
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
