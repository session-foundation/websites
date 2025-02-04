'use client';

import {
  formatAndHandleLocalizedContractErrorMessages,
  parseContractStatusToProgressStatus,
} from '@/lib/contracts';
import { useCreateOpenNode } from '@session/contracts/hooks/ServiceNodeContributionFactory';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import type { Address } from 'viem';

export type ReservedContributorStruct = {
  addr: Address;
  amount: bigint;
};

export type UseCreateOpenNodeContractParams = {
  blsPubKey: string;
  blsSignature: string;
  nodePubKey: string;
  userSignature: string;
  reservedContributors: Array<ReservedContributorStruct>;
  fee: number;
  autoStart: boolean;
};

export default function useCreateOpenNodeRegistration({
  blsPubKey,
  blsSignature,
  nodePubKey,
  reservedContributors,
  userSignature,
  fee,
  autoStart,
}: UseCreateOpenNodeContractParams) {
  const [enabled, setEnabled] = useState<boolean>(false);

  const dict = useTranslations('actionModules.registration.submitMulti');
  const dictGeneral = useTranslations('general');

  const {
    createOpenNode,
    contractCallStatus,
    simulateError,
    writeError,
    transactionError,
    resetContract,
  } = useCreateOpenNode({
    blsPubKey,
    blsSignature,
    nodePubKey,
    userSignature,
    reservedContributors,
    fee,
    autoStart,
  });

  const createOpenNodeContract = () => {
    setEnabled(true);
  };

  const resetCreateOpenNodeContract = () => {
    resetContract();
    createOpenNode();
  };

  const createNodeContractErrorMessage = useMemo(
    () =>
      formatAndHandleLocalizedContractErrorMessages({
        errorGroupDictKey: 'create',
        dict,
        dictGeneral,
        simulateError,
        writeError: writeError,
        transactionError: transactionError,
      }),
    [simulateError, writeError, transactionError]
  );

  const createNodeContractStatus = useMemo(
    () => parseContractStatusToProgressStatus(contractCallStatus),
    [contractCallStatus]
  );

  // NOTE: Automatically triggers the write stage once the approval has succeeded
  useEffect(() => {
    if (enabled) {
      createOpenNode();
    }
  }, [enabled]);

  return {
    createOpenNodeContract,
    resetCreateOpenNodeContract,
    createNodeContractErrorMessage,
    createNodeContractStatus,
    enabled,
    simulateError,
    writeError,
    transactionError,
  };
}
