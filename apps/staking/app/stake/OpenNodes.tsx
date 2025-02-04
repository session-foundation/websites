'use client';

import { OpenNodeCard } from '@/components/OpenNodeCard';
import { URL } from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import { ModuleGridInfoContent } from '@session/ui/components/ModuleGrid';
import { useTranslations } from 'next-intl';
import { NodesListSkeleton } from '@/components/NodesListModule';
import { useEffect, useMemo } from 'react';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useNetworkStatus } from '@/components/StatusBar';
import { useOpenContributorContracts } from '@/hooks/useOpenContributorContracts';
import { useStakes } from '@/hooks/useStakes';

export default function OpenNodes() {
  const dictionary = useTranslations('modules.openNodes');

  const { contracts, network, isFetching, refetch, isError, isLoading } =
    useOpenContributorContracts();

  const { hiddenContractsWithStakes } = useStakes();

  const { setNetworkStatusVisible } = useNetworkStatus(network, isFetching, refetch);

  const openContractBlsKeys = useMemo(() => {
    return new Set(contracts.map(({ pubkey_bls }) => pubkey_bls));
  }, [contracts]);

  useEffect(() => {
    setNetworkStatusVisible(true);
    return () => {
      setNetworkStatusVisible(false);
    };
  }, []);

  return isError ? (
    <ErrorMessage
      refetch={refetch}
      message={dictionary.rich('error')}
      buttonText={dictionary('errorButton')}
      buttonDataTestId={ButtonDataTestId.Open_Nodes_Error_Retry}
    />
  ) : isLoading ? (
    <NodesListSkeleton />
  ) : contracts?.length || hiddenContractsWithStakes?.length ? (
    <>
      {hiddenContractsWithStakes
        .filter(({ pubkey_bls }) => !openContractBlsKeys.has(pubkey_bls))
        .map((contract) => (
          <OpenNodeCard key={contract.address} contract={contract} showAlreadyRunningWarning />
        ))}
      {contracts.map((contract) => (
        <OpenNodeCard key={contract.address} contract={contract} />
      ))}
    </>
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
