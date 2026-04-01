'use client';
import { ErrorBox } from '@/components/Error/ErrorBox';
import { ErrorMessage } from '@/components/ErrorMessage';
import { NodeListModuleContent, NodesListSkeleton } from '@/components/NodesListModule';
import { VIEW_MODE } from '@/components/StakedNode/StakeCard';
import {
  StakedContractCard,
  getStakedContractCardContractFromConfirmation,
} from '@/components/StakedNode/StakedContractCard';
import { StakedNodeCard } from '@/components/StakedNodeCard';
import { useDisplayStatusBar } from '@/components/StatusBar';
import WalletButtonWithLocales from '@/components/WalletButtonWithLocales';
import { useAddressStakes } from '@/hooks/useStakes';
import { PREFERENCE } from '@/lib/constants';
import { internalLink } from '@/lib/locale-defaults';
import { useAllowTestingErrorToThrow } from '@/lib/testing';
import { type useStakes, useUser } from '@/providers/user-provider';
import { useActiveVestingContract } from '@/providers/vesting-provider';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { CONTRIBUTION_CONTRACT_STATUS } from '@session/staking-api-js/enums';
import type {
  ContributionContract,
  ContributionContractNotReady,
  Stake,
} from '@session/staking-api-js/schema';
import {
  ModuleGridHeader,
  ModuleGridInfoContent,
  ModuleGridTitle,
} from '@session/ui/components/ModuleGrid';
import { CogIcon } from '@session/ui/icons/CogIcon';
import { XIcon } from '@session/ui/icons/XIcon';
import { Button } from '@session/ui/ui/button';
import { Switch } from '@session/ui/ui/switch';
import type { EthereumAddress } from '@session/util-crypto/keys';
import { useTranslations } from 'next-intl';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { usePref } from 'usepref';

type StakesListProps = {
  stakesData: ReturnType<typeof useStakes>;
  address: EthereumAddress;
  scopeId: string;
  hideButtons?: boolean;
};

export function StakedNodesForCurrentActorAddress({
  scopeId = 'none',
  hideButtons = false,
}: { scopeId: string; hideButtons: boolean }) {
  const { stakes, activeAddress } = useUser();
  return activeAddress ? (
    <StakedNodesFromData
      stakesData={stakes}
      address={activeAddress}
      scopeId={scopeId}
      hideButtons={hideButtons}
    />
  ) : (
    <NoWallet />
  );
}

export function StakedNodesForAddress({
  address,
  scopeId = 'none',
  hideButtons = false,
}: { scopeId?: string; hideButtons?: boolean; address: EthereumAddress }) {
  const user = useUser();
  const stakes = useAddressStakes(user.contractNodes, address);
  return address ? (
    <StakedNodesFromData
      stakesData={stakes}
      address={address}
      scopeId={scopeId}
      hideButtons={hideButtons}
    />
  ) : null;
}

export function StakedNodesFromData({
  stakesData,
  address,
  scopeId,
  hideButtons,
}: StakesListProps) {
  useAllowTestingErrorToThrow();
  const dictionary = useTranslations('modules.stakedNodes');
  const {
    stakes,
    hiddenContractsWithStakes,
    visibleContracts,
    joiningContracts,
    notFoundJoiningNodes,
    network,
    blockHeight,
    networkTime,
    isLoading,
    isFetching,
    refetch,
    isError,
  } = stakesData;
  useDisplayStatusBar({ network, isLoading, isFetching, refetch });

  const { getItem } = usePref();
  const mode = getItem<string>(PREFERENCE.MY_STAKES_SETTINGS_VIEW) || 'simple';

  const viewMode = mode === 'detailed' ? VIEW_MODE.DETAILED : VIEW_MODE.SIMPLE;

  const isDetailedView = viewMode === VIEW_MODE.DETAILED;
  const rows = useMemo(() => {
    const items: Array<{
      variant: 'contract' | 'stake';
      key: string;
      toggleId: string;
      contract?: ContributionContract | ContributionContractNotReady | null;
      stake?: Stake | null;
      showAlreadyRunningWarning?: boolean;
    }> = [];

    for (const node of notFoundJoiningNodes) {
      items.push({
        variant: 'contract',
        key: node.pubkeyEd25519,
        toggleId: `${scopeId}.${node.pubkeyEd25519}`,
        contract: getStakedContractCardContractFromConfirmation(node),
      });
    }

    for (const node of hiddenContractsWithStakes) {
      items.push({
        variant: 'contract',
        key: node.address,
        toggleId: `${scopeId}.${node.address}`,
        contract: node,
        showAlreadyRunningWarning: true,
      });
    }

    for (const node of joiningContracts) {
      items.push({
        variant: 'contract',
        key: node.address,
        toggleId: `${scopeId}.${node.address}`,
        contract: node,
      });
    }

    for (const node of visibleContracts) {
      if (node.status === CONTRIBUTION_CONTRACT_STATUS.WaitForOperatorContrib) {
        continue;
      }
      items.push({
        variant: 'contract',
        key: node.address,
        toggleId: `${scopeId}.${node.address}`,
        contract: node,
      });
    }

    for (const node of stakes) {
      items.push({
        variant: 'stake',
        key: node.contract_id.toString(),
        toggleId: `${scopeId}.${node.contract_id.toString()}`,
        stake: node,
      });
    }

    return items;
  }, [
    notFoundJoiningNodes,
    hiddenContractsWithStakes,
    joiningContracts,
    visibleContracts,
    stakes,
    scopeId,
  ]);

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
        <NodesListSkeleton />
      ) : rows.length && blockHeight && networkTime ? (
        rows.map(({ key, variant, contract, stake, ...rest }) => {
          if (variant === 'contract' && contract) {
            return (
              <StakedContractCard
                {...rest}
                key={key}
                contract={contract}
                isDetailedView={isDetailedView}
                hideButton={hideButtons}
                targetWalletAddress={address}
              />
            );
          }

          if (variant === 'stake' && stake) {
            return (
              <StakedNodeCard
                {...rest}
                key={key}
                stake={stake}
                isDetailedView={isDetailedView}
                hideButton={hideButtons}
                targetWalletAddress={address}
              />
            );
          }

          return null;
        })
      ) : (
        <NoNodes />
      )}
    </NodeListModuleContent>
  );
}

export default function StakedNodesModule() {
  const [inSettings, setInSettings] = useState(false);
  const { getItem, setItem } = usePref();

  const mode = getItem<string>(PREFERENCE.MY_STAKES_SETTINGS_VIEW) || 'simple';

  const [stateMode, setStateMode] = useState(mode);

  const dictionary = useTranslations('modules.stakedNodes');

  const handleChange = () => {
    const newMode = stateMode === 'simple' ? 'detailed' : 'simple';
    setStateMode(newMode);
    setItem(PREFERENCE.MY_STAKES_SETTINGS_VIEW, newMode);
  };

  return (
    <>
      <ModuleGridHeader>
        <ModuleGridTitle>{dictionary('title')}</ModuleGridTitle>
        <div className="me-4 flex flex-row items-center gap-2 align-middle">
          {inSettings ? (
            <>
              <div className="flex flex-row gap-2">
                Simple
                <Switch checked={stateMode === 'detailed'} onCheckedChange={handleChange} />
                Detailed
              </div>
            </>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setInSettings((prev) => !prev)}
            data-testid={ButtonDataTestId.My_Stakes_Settings}
          >
            {inSettings ? <XIcon /> : <CogIcon />}
          </Button>
        </div>
      </ModuleGridHeader>
      <ErrorBoundary errorComponent={ErrorBox}>
        <StakedNodesForCurrentActorAddress scopeId={'main'} hideButtons={false} />
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
