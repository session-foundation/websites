'use client';

import { useTranslations } from 'next-intl';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useMemo } from 'react';
import { ActionModuleRowSkeleton } from '@/components/ActionModule';
import { ButtonSkeleton } from '@session/ui/ui/button';
import { type Address } from 'viem';
import { Loading } from '@session/ui/components/loading';
import { useStakingBackendSuspenseQuery } from '@/lib/staking-api-client';
import { getContributionContracts } from '@/lib/queries/getContributionContracts';
import { areHexesEqual } from '@session/util-crypto/string';
import { ManageStake } from '@/app/stake/[address]/ManageStake';
import { NewStake } from '@/app/stake/[address]/NewStake';
import { getContributedContributor } from '@/app/stake/[address]/StakeInfo';

export function getContractAndContributor({
  data,
  address,
  connectedAddress,
}: {
  data: Awaited<ReturnType<typeof getContributionContracts>>['data'];
  address: string;
  connectedAddress?: string;
}) {
  const foundContract = data?.contracts?.find((contract) =>
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

  const { address: connectedAddress } = useWallet();

  const { contributor } = useMemo(
    () => getContractAndContributor({ data, address, connectedAddress }),
    [data, address, connectedAddress]
  );

  return dict(contributor ? 'titleManageStake' : 'titleNewStake');
}

export default function Staking({ address }: { address: string }) {
  const { data, isLoading } = useStakingBackendSuspenseQuery(getContributionContracts);
  const dictionary = useTranslations('general');

  const { address: connectedAddress } = useWallet();

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

export type ParsedStakeData = {
  stakeAmount: bigint;
  beneficiaryAddress?: Address;
};

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
