'use client';

import { OpenNodeCard } from '@/components/OpenNodeCard';
import { URL } from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import { ModuleGridInfoContent } from '@session/ui/components/ModuleGrid';
import { useTranslations } from 'next-intl';
import { useStakingBackendQuery, useStakingBackendSuspenseQuery } from '@/lib/staking-api-client';
import { getContributionContracts } from '@/lib/queries/getContributionContracts';
import { NodesListSkeleton } from '@/components/NodesListModule';
import { useMemo } from 'react';
import { CONTRIBUTION_CONTRACT_STATUS } from '@session/staking-api-js/client';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { getNodesBlsKeys } from '@/lib/queries/getNodesBlsKeys';
import { TriangleAlertIcon } from '@session/ui/icons/TriangleAlertIcon';
import { Button } from '@session/ui/ui/button';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { sortContracts } from '@/hooks/useStakes';

export default function OpenNodes() {
  const {
    data: contractsData,
    isLoading: isLoadingContracts,
    refetch,
    isError,
  } = useStakingBackendSuspenseQuery(getContributionContracts);
  const { data: blsKeysData, isLoading: isLoadingBlsKeys } =
    useStakingBackendQuery(getNodesBlsKeys);
  const { address } = useWallet();

  const contracts = useMemo(() => {
    if (!contractsData) return null;
    const contractsArray =
      'contracts' in contractsData && Array.isArray(contractsData.contracts)
        ? contractsData.contracts
        : [];

    if (address) {
      contractsArray.sort((a, b) => sortContracts(a, b, address));
    }

    return contractsArray;
  }, [contractsData, address]);

  const blsKeys = useMemo(() => {
    if (!blsKeysData) return new Set<string>();
    const blsKeysObject =
      'bls_keys' in blsKeysData && typeof blsKeysData.bls_keys === 'object'
        ? blsKeysData.bls_keys
        : {};

    return new Set(Object.keys(blsKeysObject));
  }, [blsKeysData]);

  const filteredContracts = useMemo(() => {
    if (!contracts) return [];
    return contracts
      .filter(({ status }) => status === CONTRIBUTION_CONTRACT_STATUS.OpenForPublicContrib)
      .filter(({ pubkey_bls }) => !blsKeys.has(pubkey_bls.slice(2)));
  }, [contracts, blsKeys]);

  return isError ? (
    <ErrorMessage refetch={refetch} />
  ) : isLoadingContracts || isLoadingBlsKeys ? (
    <NodesListSkeleton />
  ) : filteredContracts?.length ? (
    filteredContracts.map((contract) => <OpenNodeCard key={contract.address} contract={contract} />)
  ) : (
    <NoNodes />
  );
}

function NoNodes() {
  const dictionary = useTranslations('modules.openNodes');
  return (
    <ModuleGridInfoContent>
      <p>{dictionary('noNodesP1')}</p>
      <p>{dictionary.rich('noNodesP2', { link: externalLink(URL.SESSION_NODE_DOCS) })}</p>
    </ModuleGridInfoContent>
  );
}

function ErrorMessage({ refetch }: { refetch: () => void }) {
  const dictionary = useTranslations('modules.openNodes');
  return (
    <ModuleGridInfoContent>
      <TriangleAlertIcon className="stroke-warning h-20 w-20" />
      <p>{dictionary.rich('error')}</p>
      <Button
        data-testid={ButtonDataTestId.Open_Nodes_Error_Retry}
        rounded="md"
        size="lg"
        onClick={refetch}
      >
        {dictionary('errorButton')}
      </Button>
    </ModuleGridInfoContent>
  );
}
