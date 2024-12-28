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
import { useEffect, useMemo } from 'react';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { getStakedNodes } from '@/lib/queries/getStakedNodes';
import { EXPERIMENTAL_FEATURE_FLAG } from '@/lib/feature-flags';
import { useExperimentalFeatureFlag } from '@/lib/feature-flags-client';
import { Address } from 'viem';
import {
  CONTRIBUTION_CONTRACT_STATUS,
  type ContributorContractInfo,
  type Stake,
} from '@session/staking-api-js/client';
import { getTotalStakedAmountForAddress } from '@/components/NodeCard';
import { areHexesEqual } from '@session/util-crypto/string';
import { parseStakeState, STAKE_STATE } from '@/components/StakedNode/state';
import { StakedContractCard } from '@/components/StakedNode/StakedContractCard';
import { useNetworkStatus } from '@/components/StatusBar';
import { TriangleAlertIcon } from '@session/ui/icons/TriangleAlertIcon';

export const sortingTotalStakedDesc = (
  a: Stake | ContributorContractInfo,
  b: Stake | ContributorContractInfo,
  address?: Address
) => {
  const stakedA = address ? getTotalStakedAmountForAddress(a.contributors, address) : 0;
  const stakedB = address ? getTotalStakedAmountForAddress(b.contributors, address) : 0;
  return stakedB - stakedA;
};

const stakeStateSortOrder = {
  [STAKE_STATE.DECOMMISSIONED]: 1,
  [STAKE_STATE.AWAITING_EXIT]: 2,
  [STAKE_STATE.RUNNING]: 3,
  [STAKE_STATE.DEREGISTERED]: 4,
  [STAKE_STATE.EXITED]: 5,
  [STAKE_STATE.UNKNOWN]: 6,
} as const;

const contractStateSortOrderIfOperator = {
  [CONTRIBUTION_CONTRACT_STATUS.WaitForFinalized]: 1,
  [CONTRIBUTION_CONTRACT_STATUS.WaitForOperatorContrib]: 2,
  [CONTRIBUTION_CONTRACT_STATUS.OpenForPublicContrib]: 3,
  [CONTRIBUTION_CONTRACT_STATUS.Finalized]: 4,
};

/**
 * Stakes are sorted by {@link stakeStateSortOrder} ascending
 * then by the amount staked by the connected wallet descending
 * then by the operator fee ascending
 *
 * NOTE: If both stakes are {@link STAKE_STATE.DECOMMISSIONED} then they are sorted by earned_downtime_blocks ascending
 * NOTE: If both stakes are {@link STAKE_STATE.AWAITING_EXIT} then they are sorted by requested_unlock_height ascending
 */
function sortStakes(a: Stake, b: Stake, address?: Address) {
  const stateA = parseStakeState(a);
  const stateB = parseStakeState(b);

  const priorityA = stakeStateSortOrder[stateA] ?? 999;
  const priorityB = stakeStateSortOrder[stateB] ?? 999;

  if (priorityA !== priorityB) {
    // Priority ascending
    return priorityA - priorityB;
  }

  // NOTE: By definition, if the priorities are the same the state is the same

  if (stateA === STAKE_STATE.DECOMMISSIONED) {
    // earned_downtime_blocks ascending
    return (a.earned_downtime_blocks ?? Infinity) - (b.earned_downtime_blocks ?? Infinity);
  }

  if (stateA === STAKE_STATE.AWAITING_EXIT) {
    // requested_unlock_height ascending
    return (a.requested_unlock_height ?? Infinity) - (b.requested_unlock_height ?? Infinity);
  }

  const stakeSort = sortingTotalStakedDesc(a, b, address);
  if (stakeSort) return stakeSort;

  // operator_fee ascending
  return (a.operator_fee ?? 0) - (b.operator_fee ?? 0);
}

/**
 * If the connected wallet is the contract operator, then the contracts are sorted by {@link contractStateSortOrderIfOperator}
 *
 * If the state is the same OR the connected wallet isn't the contract operator, then the contract are sorted by the total staked amount descending
 * then by the operator fee ascending
 */
export function sortContracts(
  a: ContributorContractInfo,
  b: ContributorContractInfo,
  address: Address
) {
  const operatorA = areHexesEqual(a.operator_address, address);
  const operatorB = areHexesEqual(b.operator_address, address);

  if (operatorA && operatorB) {
    const priorityA = contractStateSortOrderIfOperator[a.status] ?? 999;
    const priorityB = contractStateSortOrderIfOperator[b.status] ?? 999;

    if (priorityA !== priorityB) {
      // Priority ascending
      return priorityA - priorityB;
    }
  }

  const stakeSort = sortingTotalStakedDesc(a, b, address);
  if (stakeSort !== 0) {
    return stakeSort;
  }
  // fee ascending
  return (a.fee ?? 0) - (b.fee ?? 0);
}

export function StakedNodesWithAddress({ address }: { address: Address }) {
  const { data, isLoading, isFetching, refetch, isError } = useStakingBackendQueryWithParams(
    getStakedNodes,
    {
      address,
    }
  );
  const { setNetworkStatusVisible } = useNetworkStatus(data?.network, isFetching, refetch);

  const [stakes, contracts, blockHeight, networkTime, stakeBlsKeys] = useMemo(() => {
    if (!data) return [[], null, null];
    const stakesArray = 'stakes' in data && Array.isArray(data.stakes) ? data.stakes : [];
    const contractsArray =
      'contracts' in data && Array.isArray(data.contracts) ? data.contracts : [];

    const blockHeight =
      'network' in data && 'block_height' in data.network && data.network.block_height
        ? data.network.block_height
        : 0;

    const networkTime =
      'network' in data && 'block_timestamp' in data.network && data.network.block_timestamp
        ? data.network.block_timestamp
        : 0;

    stakesArray.sort((a, b) => sortStakes(a, b, address));
    contractsArray.sort((a, b) => sortContracts(a, b, address));

    const stakeBlsKeys = new Set(stakesArray.map(({ service_node_pubkey }) => service_node_pubkey));

    return [stakesArray, contractsArray, blockHeight, networkTime, stakeBlsKeys];
  }, [data, address]);

  useEffect(() => {
    setNetworkStatusVisible(true);
    return () => {
      setNetworkStatusVisible(false);
    };
  }, [data]);

  return (
    <ModuleGridContent className="h-full md:overflow-y-auto">
      {isError ? (
        <ErrorMessage refetch={refetch} />
      ) : isLoading ? (
        <Loading />
      ) : (stakes?.length || contracts?.length) && blockHeight && networkTime ? (
        <>
          {contracts
            .filter(({ service_node_pubkey }) => !stakeBlsKeys.has(service_node_pubkey))
            .map((contract) => {
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
