'use client';

import { ErrorMessage } from '@/components/ErrorMessage';
import { NodeRegistrationCard } from '@/components/NodeRegistrationCard';
import { NodesListSkeleton } from '@/components/NodesListModule';
import { useNetworkStatus } from '@/components/StatusBar';
import WalletButtonWithLocales from '@/components/WalletButtonWithLocales';
import { useRegistrationsForCurrentActor } from '@/hooks/useRegistrationsForCurrentActor';
import { URL } from '@/lib/constants';
import { FEATURE_FLAG } from '@/lib/feature-flags';
import { useFeatureFlag } from '@/lib/feature-flags-client';
import { externalLink } from '@/lib/locale-defaults';
import logger from '@/lib/logger';
import { useAllowTestingErrorToThrow } from '@/lib/testing';
import { useUser } from '@/providers/user-provider';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import type { Registration } from '@session/staking-api-js/schema';
import { ModuleGridInfoContent } from '@session/ui/components/ModuleGrid';
import { ArrowDownIcon } from '@session/ui/icons/ArrowDownIcon';
import { safeTrySyncWithFallback } from '@session/util-js/try';
import { useMount } from '@session/util-react/hooks/useMount';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';

const OLDER_REGISTRATION_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export default function NodeRegistrations() {
  useAllowTestingErrorToThrow();
  const dictionary = useTranslations('modules.nodeRegistrations');
  const showNoNodes = useFeatureFlag(FEATURE_FLAG.MOCK_NO_PENDING_NODES);

  // TODO: use once we have user preferences
  /* const hideRegistrationsEnabled = useExperimentalFeatureFlag(
     EXPERIMENTAL_FEATURE_FLAG.HIDE_REGISTRATIONS
   );
   const hiddenPreparedRegistrations = useUserPreference('hiddenPreparedRegistrations');
   const forceShowPendingNodesModule = useUserPreference('forceShowPendingNodesModule');

   const [showHidden, setShowHidden] = useState<boolean>(false); */

  const { isConnected } = useWallet();
  const { data, isLoading, isError, refetch, isFetching } = useRegistrationsForCurrentActor();

  const network = useMemo(
    () => (data && 'network' in data && data.network ? data.network : null),
    [data]
  );

  const { setNetworkStatusVisible } = useNetworkStatus({ network, isLoading, isFetching, refetch });

  const { contractNodes } = useUser();

  /**
   * - Sorted in descending order by the `timestamp` of the registration.
   * - Remove registrations that have bls keys already in the smart contract.
   * - Remove duplicate registrations, keeping only the most recent.
   */
  const registrations = useMemo(() => {
    if (showNoNodes || !data || isLoading || contractNodes.isLoading) {
      return [];
    }

    const addedRegistrationBlsKeys = new Set();
    const addedRegistrationEd25519Keys = new Set();

    const [error, registrations] = safeTrySyncWithFallback(() => data.registrations, []);
    if (error) logger.error(error);

    return registrations
      .sort(({ timestamp: tA }, { timestamp: tB }) => tB - tA)
      .filter(({ pubkey_bls, pubkey_ed25519 }) => {
        if (
          !contractNodes.blsSet.has(pubkey_bls) &&
          !addedRegistrationBlsKeys.has(pubkey_bls) &&
          !contractNodes.ed25519Set.has(pubkey_ed25519) &&
          !addedRegistrationEd25519Keys.has(pubkey_ed25519)
        ) {
          addedRegistrationBlsKeys.add(pubkey_bls);
          addedRegistrationEd25519Keys.add(pubkey_ed25519);
          return true;
        }
        return false;
      });
  }, [data, contractNodes, showNoNodes, isLoading]);

  useMount(() => {
    if (isConnected) {
      setNetworkStatusVisible(true);
    }
    return () => {
      setNetworkStatusVisible(false);
    };
  });

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
  ) : isConnected ? (
    isLoading || contractNodes.isLoading ? (
      <NodesListSkeleton />
    ) : registrations?.length ? (
      <RegistrationsList registrations={registrations} />
    ) : (
      <NoNodes />
    )
  ) : (
    <NoWallet />
  );
}

/** Registrations prepared over a month ago are folded away so recent ones stay at the top. */
function RegistrationsList({ registrations }: { registrations: Array<Registration> }) {
  const dictionary = useTranslations('modules.nodeRegistrations');
  const pathname = usePathname();

  const [recent, older] = useMemo(() => {
    const cutoff = Date.now() - OLDER_REGISTRATION_AGE_MS;
    return [
      registrations.filter(({ timestamp }) => timestamp * 1000 >= cutoff),
      registrations.filter(({ timestamp }) => timestamp * 1000 < cutoff),
    ];
  }, [registrations]);

  const olderIsOpenInForm = older.some(
    ({ pubkey_ed25519 }) => pathname === `/register/${pubkey_ed25519}`
  );

  return (
    <>
      {recent.map((node) => (
        <NodeRegistrationCard key={node.pubkey_ed25519} node={node} />
      ))}
      {older.length ? (
        <details className="group/older" open={olderIsOpenInForm}>
          <summary
            className="flex cursor-pointer list-none items-center gap-2 py-2 font-medium text-session-text text-sm [&::-webkit-details-marker]:hidden"
            data-testid={ButtonDataTestId.Older_Prepared_Registrations_Toggle}
          >
            {dictionary('olderTitle', { count: older.length })}
            <ArrowDownIcon className="h-3 w-3 fill-session-text stroke-session-text transition-transform duration-300 group-open/older:rotate-180 motion-reduce:transition-none" />
          </summary>
          <div className="flex flex-col gap-4">
            {older.map((node) => (
              <NodeRegistrationCard key={node.pubkey_ed25519} node={node} />
            ))}
          </div>
        </details>
      ) : null}
    </>
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
