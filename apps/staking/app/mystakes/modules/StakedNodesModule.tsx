'use client';

import Loading from '@/app/loading';
import {
  hasDeregistrationUnlockHeight,
  isBeingDeregistered,
  isReadyToExit,
  isRequestingToExit,
  StakedNodeCard,
} from '@/components/StakedNodeCard';
import { WalletModalButtonWithLocales } from '@/components/WalletModalButtonWithLocales';
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
import { useWallet } from '@session/wallet/hooks/wallet-hooks';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo } from 'react';
import { useStakingBackendQueryWithParams } from '@/lib/sent-staking-backend-client';
import { getStakedNodes } from '@/lib/queries/getStakedNodes';
import { EXPERIMENTAL_FEATURE_FLAG, FEATURE_FLAG } from '@/lib/feature-flags';
import { useExperimentalFeatureFlag, useFeatureFlag } from '@/lib/feature-flags-client';
import { Address } from 'viem';
import { NODE_STATE, type Stake } from '@session/sent-staking-js/client';

export const sortAndGroupStakes = (nodes: Array<Stake>, blockHeight: number) => {
  nodes.sort((a, b) => {
    if (a.staked_balance === b.staked_balance) return (a.operator_fee ?? 0) - (b.operator_fee ?? 0);
    return (b.staked_balance ?? 0) - (a.staked_balance ?? 0);
  });

  const decommissioning = [];
  const readyToExit = [];
  const exiting = [];
  const running = [];
  const other = [];

  for (const node of nodes) {
    if (isBeingDeregistered(node)) decommissioning.push(node);
    else if (isReadyToExit(node, blockHeight)) readyToExit.push(node);
    else if (isRequestingToExit(node, blockHeight) || hasDeregistrationUnlockHeight(node)) {
      exiting.push(node);
    } else if (node.state === NODE_STATE.RUNNING) running.push(node);
    else other.push(node);
  }

  decommissioning.sort(
    (a, b) =>
      (a.deregistration_unlock_height ?? a.requested_unlock_height ?? 0) -
      (b.deregistration_unlock_height ?? b.requested_unlock_height ?? 0)
  );

  readyToExit.sort((a, b) => (a.requested_unlock_height ?? 0) - (b.requested_unlock_height ?? 0));

  return [...decommissioning, ...readyToExit, ...exiting, ...running, ...other];
};

export function StakedNodesWithAddress({ address }: { address: Address }) {
  const showMockNodes = useFeatureFlag(FEATURE_FLAG.MOCK_STAKED_NODES);
  const showNoNodes = useFeatureFlag(FEATURE_FLAG.MOCK_NO_STAKED_NODES);

  if (showMockNodes && showNoNodes) {
    console.error('Cannot show mock nodes and no nodes at the same time');
  }

  const { data, isLoading } = useStakingBackendQueryWithParams(getStakedNodes, {
    address,
  });

  const [stakes, blockHeight, networkTime] = useMemo(() => {
    if (showMockNodes) {
      return [[], 0, 0];
    } else if (!data || showNoNodes) {
      return [[], null, null];
    }

    return [
      sortAndGroupStakes([...data.stakes, ...data.historical_stakes], data.network.block_height),
      data.network.block_height,
      data.network.block_timestamp,
    ];
  }, [data, showMockNodes, showNoNodes]);

  return (
    <ModuleGridContent className="h-full md:overflow-y-auto">
      {isLoading ? (
        <Loading />
      ) : stakes?.length && blockHeight && networkTime ? (
        stakes.map((node) => {
          return (
            <StakedNodeCard
              key={node.unique_id}
              node={node}
              blockHeight={blockHeight}
              networkTime={networkTime}
              targetWalletAddress={address}
            />
          );
        })
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
      <WalletModalButtonWithLocales rounded="md" size="lg" />
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
