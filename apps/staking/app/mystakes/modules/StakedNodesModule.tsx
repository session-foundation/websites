'use client';

import Loading from '@/app/loading';
import { ErrorBox } from '@/components/Error/ErrorBox';
import { ErrorMessage } from '@/components/ErrorMessage';
import { NodeListModuleContent } from '@/components/NodesListModule';
import { StakedContractCard } from '@/components/StakedNode/StakedContractCard';
import { StakedNodeCard } from '@/components/StakedNodeCard';
import { useNetworkStatus } from '@/components/StatusBar';
import WalletButtonWithLocales from '@/components/WalletButtonWithLocales';
import { useStakes } from '@/hooks/useStakes';
import { EXPERIMENTAL_FEATURE_FLAG } from '@/lib/feature-flags';
import { useExperimentalFeatureFlag } from '@/lib/feature-flags-client';
import { internalLink } from '@/lib/locale-defaults';
import { useAllowTestingErrorToThrow } from '@/lib/testing';
import { useActiveVestingContract } from '@/providers/vesting-provider';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import {
  ModuleGridHeader,
  ModuleGridInfoContent,
  ModuleGridTitle,
} from '@session/ui/components/ModuleGrid';
import { Button } from '@session/ui/ui/button';
import { Switch } from '@session/ui/ui/switch';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import Link from 'next/link';
import { useEffect } from 'react';
import type { Address } from 'viem';

export function StakedNodesWithAddress({ address }: { address: Address }) {
  useAllowTestingErrorToThrow();
  const dictionary = useTranslations('modules.stakedNodes');
  const {
    stakes,
    hiddenContractsWithStakes,
    visibleContracts,
    network,
    blockHeight,
    networkTime,
    isLoading,
    isFetching,
    refetch,
    isError,
  } = useStakes(address);
  const { setNetworkStatusVisible } = useNetworkStatus({ network, isLoading, isFetching, refetch });

  // biome-ignore lint/correctness/useExhaustiveDependencies: On mount
  useEffect(() => {
    setNetworkStatusVisible(true);
    return () => {
      setNetworkStatusVisible(false);
    };
  }, []);

  return (
    <NodeListModuleContent>
      {isError ? (
        <ErrorMessage
          refetch={refetch}
          message={dictionary.rich('error')}
          buttonText={dictionary('errorButton')}
          buttonDataTestId={ButtonDataTestId.Staked_Node_Error_Retry}
        />
      ) : isLoading ? (
        <Loading />
      ) : (stakes?.length || hiddenContractsWithStakes?.length || visibleContracts?.length) &&
        blockHeight &&
        networkTime ? (
        <>
          {hiddenContractsWithStakes.map((contract) => {
            return (
              <StakedContractCard
                key={contract.address}
                id={contract.address}
                contract={contract}
                targetWalletAddress={address}
              />
            );
          })}
          {visibleContracts.map((contract) => {
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
    </NodeListModuleContent>
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
      <ErrorBoundary errorComponent={ErrorBox}>
        {address ? <StakedNodesWithAddress address={address} /> : <NoWallet />}
      </ErrorBoundary>
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

function NoNodes() {
  const dictionary = useTranslations(
    useActiveVestingContract() ? 'vesting.modules.stakes' : 'modules.stakedNodes'
  );
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
