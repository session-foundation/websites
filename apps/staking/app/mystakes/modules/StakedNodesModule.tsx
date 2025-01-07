'use client';

import Loading from '@/app/loading';
import { StakedNodeCard } from '@/components/StakedNodeCard';
import { WalletButtonWithLocales } from '@/components/WalletButtonWithLocales';
import { internalLink } from '@/lib/locale-defaults';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import {
  ModuleGridContent,
  ModuleGridHeader,
  ModuleGridInfoContent,
  ModuleGridTitle,
} from '@session/ui/components/ModuleGrid';
import { Button } from '@session/ui/ui/button';
import { Switch } from '@session/ui/ui/switch';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect } from 'react';
import { EXPERIMENTAL_FEATURE_FLAG } from '@/lib/feature-flags';
import { useExperimentalFeatureFlag } from '@/lib/feature-flags-client';
import { Address } from 'viem';
import { StakedContractCard } from '@/components/StakedNode/StakedContractCard';
import { useNetworkStatus } from '@/components/StatusBar';
import { TriangleAlertIcon } from '@session/ui/icons/TriangleAlertIcon';
import { useStakes } from '@/hooks/useStakes';

export function StakedNodesWithAddress({ address }: { address: Address }) {
  const {
    stakes,
    contracts,
    network,
    blockHeight,
    networkTime,
    isLoading,
    isFetching,
    refetch,
    isError,
  } = useStakes(address);
  const { setNetworkStatusVisible } = useNetworkStatus(network, isFetching, refetch);

  useEffect(() => {
    setNetworkStatusVisible(true);
    return () => {
      setNetworkStatusVisible(false);
    };
  }, []);

  return (
    <ModuleGridContent className="h-full md:overflow-y-auto">
      {isError ? (
        <ErrorMessage refetch={refetch} />
      ) : isLoading ? (
        <Loading />
      ) : (stakes?.length || contracts?.length) && blockHeight && networkTime ? (
        <>
          {contracts.map((contract) => {
            return (
              <StakedContractCard
                key={contract.address}
                id={contract.address}
                contract={contract}
                targetWalletAddress={address}
              />
            );
          })}
          {stakes.map((stake) => {
            return (
              <StakedNodeCard
                key={stake.contract_id}
                id={stake.contract_id.toString()}
                stake={stake}
                blockHeight={blockHeight}
                networkTime={networkTime}
                targetWalletAddress={address}
              />
            );
          })}
        </>
      ) : (
        <NoNodes />
      )}
    </ModuleGridContent>
  );
}

export default function StakedNodesModule() {
  const hideStakedNodesFlagEnabled = useExperimentalFeatureFlag(
    EXPERIMENTAL_FEATURE_FLAG.HIDE_STAKED_NODES
  );
  const dictionary = useTranslations('modules.stakedNodes');
  const { address } = useWallet();

  return (
    <>
      <ModuleGridHeader>
        <ModuleGridTitle>{dictionary('title')}</ModuleGridTitle>
        <div className="flex flex-row gap-2 align-middle">
          {hideStakedNodesFlagEnabled ? (
            <>
              <span className="hidden sm:block">{dictionary('showHiddenText')}</span>
              <Switch />
            </>
          ) : null}
        </div>
      </ModuleGridHeader>
      {address ? <StakedNodesWithAddress address={address} /> : <NoWallet />}
    </>
  );
}

function NoWallet() {
  const dictionary = useTranslations('modules.stakedNodes');
  return (
    <ModuleGridInfoContent>
      <p>{dictionary('noWalletP1')}</p>
      <p>{dictionary('noWalletP2')}</p>
      <WalletButtonWithLocales rounded="md" size="lg" />
    </ModuleGridInfoContent>
  );
}

function ErrorMessage({ refetch }: { refetch: () => void }) {
  const dictionary = useTranslations('modules.stakedNodes');
  return (
    <ModuleGridInfoContent>
      <TriangleAlertIcon className="stroke-warning h-20 w-20" />
      <p>{dictionary.rich('error')}</p>
      <Button
        data-testid={ButtonDataTestId.My_Stakes_Error_Retry}
        rounded="md"
        size="lg"
        onClick={refetch}
      >
        {dictionary('errorButton')}
      </Button>
    </ModuleGridInfoContent>
  );
}

function NoNodes() {
  const dictionary = useTranslations('modules.stakedNodes');
  return (
    <ModuleGridInfoContent>
      <p>{dictionary('noNodesP1')}</p>
      <p>{dictionary.rich('noNodesP2', { link: internalLink('/stake') })}</p>
      <Link href="/stake" prefetch>
        <Button
          aria-label={dictionary('stakeNowButtonAria')}
          data-testid={ButtonDataTestId.My_Stakes_Stake_Now}
          rounded="md"
          size="lg"
        >
          {dictionary('stakeNowButtonText')}
        </Button>
      </Link>
    </ModuleGridInfoContent>
  );
}
