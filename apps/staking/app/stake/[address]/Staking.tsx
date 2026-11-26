'use client';

import { ManageStake } from '@/app/stake/[address]/ManageStake';
import { NewStake } from '@/app/stake/[address]/NewStake';
import { getContributedContributor } from '@/app/stake/[address]/StakeInfo';
import { ActionModuleRowSkeleton } from '@/components/ActionModule';
import { getReadyContracts } from '@/hooks/parseContracts';
import { useRefetchContributionContracts } from '@/hooks/useRefetchContributionContracts';
import { BACKEND, PREFERENCE } from '@/lib/constants';
import { getContributionContractByAddress } from '@/lib/queries/getContributionContractByAddress';
import { useStakingBackendSuspenseQueryWithParams } from '@/lib/staking-api-client';
import { useDevicePref } from '@/providers/preferences-provider';
import { useUser } from '@/providers/user-provider';
import { useVesting } from '@/providers/vesting-provider';
import { Loading } from '@session/ui/components/loading';
import { ButtonSkeleton } from '@session/ui/ui/button';
import { type EthereumAddress, isEthereumAddress } from '@session/util-crypto/keys';
import { areEthereumAddressesEqual } from '@session/util-crypto/string';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export function getContractAndContributor({
  data,
  address,
  connectedAddress,
}: {
  data: Awaited<ReturnType<typeof getContributionContractByAddress>>['data'];
  address: string;
  connectedAddress?: EthereumAddress;
}) {
  const readyContracts = getReadyContracts(data?.contracts ?? []);

  const foundContract = readyContracts.find(
    (contract) => isEthereumAddress(address) && areEthereumAddressesEqual(contract.address, address)
  );
  if (!foundContract) {
    return {
      contract: null,
      contributor: null,
    };
  }

  const foundContributor = getContributedContributor(foundContract, connectedAddress);

  return {
    contract: foundContract,
    contributor: foundContributor,
  };
}

export function StakingActionModuleTitle({ address }: { address: string }) {
  const dict = useTranslations('actionModules.staking');
  if (!isEthereumAddress(address)) return dict('titleNewStake');
  return <StakingActionModuleTitleForContract address={address} />;
}

function StakingActionModuleTitleForContract({ address }: { address: EthereumAddress }) {
  const dict = useTranslations('actionModules.staking');
  const { data } = useStakingBackendSuspenseQueryWithParams(getContributionContractByAddress, {
    address,
  });

  const { activeAddress } = useUser();

  const { contributor } = useMemo(
    () => getContractAndContributor({ data, address, connectedAddress: activeAddress }),
    [data, address, activeAddress]
  );

  return dict(contributor ? 'titleManageStake' : 'titleNewStake');
}

export default function Staking({ address }: { address: string }) {
  const dictionary = useTranslations('general');
  if (!isEthereumAddress(address)) return <span>{dictionary('nodeNotFound')}</span>;
  return <StakingForContract address={address} />;
}

function StakingForContract({ address }: { address: EthereumAddress }) {
  const autoRefresh = useDevicePref(PREFERENCE.DISABLE_BACKEND_AUTO_REFRESH);
  const refetch = useRefetchContributionContracts();
  const { data, isLoading } = useStakingBackendSuspenseQueryWithParams(
    getContributionContractByAddress,
    { address },
    {
      refetchInterval: autoRefresh
        ? BACKEND.L2_BACKGROUND_UPDATE_INTERVAL_SECONDS * 1000
        : undefined,
    }
  );
  const dictionary = useTranslations('general');

  const { activeAddress } = useUser();
  const { isLoading: isLoadingVesting } = useVesting();

  const { contract, contributor } = useMemo(
    () => getContractAndContributor({ data, address, connectedAddress: activeAddress }),
    [data, address, activeAddress]
  );

  return isLoading ? (
    <Loading />
  ) : contract ? (
    contributor ? (
      <ManageStake contract={contract} refetch={refetch} />
    ) : !isLoadingVesting ? (
      <NewStake contract={contract} refetch={refetch} />
    ) : null
  ) : (
    <span>{dictionary('nodeNotFound')}</span>
  );
}

export function NodeStakingFormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <ActionModuleRowSkeleton />
      <ActionModuleRowSkeleton />
      <ActionModuleRowSkeleton />
      <ActionModuleRowSkeleton />
      <ActionModuleRowSkeleton />
      <ActionModuleRowSkeleton />
      <ButtonSkeleton rounded="lg" size="lg" />
    </div>
  );
}
