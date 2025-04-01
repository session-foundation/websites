'use client';

import { ManageStake } from '@/app/stake/[address]/ManageStake';
import { NewStake } from '@/app/stake/[address]/NewStake';
import { getContributedContributor } from '@/app/stake/[address]/StakeInfo';
import { ActionModuleRowSkeleton } from '@/components/ActionModule';
import { getReadyContracts } from "@/hooks/useContributeStakeToOpenNode";
import { useCurrentActor } from '@/hooks/useCurrentActor';
import { getContributionContracts } from '@/lib/queries/getContributionContracts';
import { useStakingBackendSuspenseQuery } from '@/lib/staking-api-client';
import { Loading } from '@session/ui/components/loading';
import { ButtonSkeleton } from '@session/ui/ui/button';
import { areHexesEqual } from '@session/util-crypto/string';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import type { Address } from 'viem';

export function getContractAndContributor({
  data,
  address,
  connectedAddress,
}: {
  data: Awaited<ReturnType<typeof getContributionContracts>>['data'];
  address: string;
  connectedAddress?: string;
}) {
  const readyContracts = getReadyContracts(data?.contracts ?? []);

  const foundContract = readyContracts.find((contract) =>
    areHexesEqual(contract.address, address)
  );

  if (!foundContract) {
    return {
      contract: null,
      contributor: null,
    };
  }

  const foundContributor = getContributedContributor(foundContract, connectedAddress as Address);

  return {
    contract: foundContract,
    contributor: foundContributor,
  };
}

export function StakingActionModuleTitle({ address }: { address: string }) {
  const dict = useTranslations('actionModules.staking');
  const { data } = useStakingBackendSuspenseQuery(getContributionContracts);

  const connectedAddress = useCurrentActor();

  const { contributor } = useMemo(
    () => getContractAndContributor({ data, address, connectedAddress }),
    [data, address, connectedAddress]
  );

  return dict(contributor ? 'titleManageStake' : 'titleNewStake');
}

export default function Staking({ address }: { address: string }) {
  const { data, isLoading } = useStakingBackendSuspenseQuery(getContributionContracts);
  const dictionary = useTranslations('general');

  const connectedAddress = useCurrentActor();

  const { contract, contributor } = useMemo(
    () => getContractAndContributor({ data, address, connectedAddress }),
    [data, address, connectedAddress]
  );

  return isLoading ? (
    <Loading />
  ) : contract ? (
    contributor ? (
      <ManageStake contract={contract} />
    ) : (
      <NewStake contract={contract} />
    )
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
