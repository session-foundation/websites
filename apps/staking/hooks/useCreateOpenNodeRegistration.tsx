'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  formatAndHandleLocalizedContractErrorMessages,
  parseContractStatusToProgressStatus,
} from '@/lib/contracts';
import { useTranslations } from 'next-intl';
import type { Address } from 'viem';
import { useCreateOpenNode } from '@session/contracts/hooks/ServiceNodeContributionFactory';

export type ReservedContributorStruct = {
  addr: Address;
  amount: bigint;
};

export default function useCreateOpenNodeRegistration({
  blsPubKey,
  blsSignature,
  nodePubKey,
  reservedContributors,
  userSignature,
  fee,
  autoStart,
}: {
  blsPubKey: string;
  blsSignature: string;
  nodePubKey: string;
  userSignature: string;
  reservedContributors: Array<ReservedContributorStruct>;
  fee: number;
  autoStart: boolean;
}) {
  const [enabled, setEnabled] = useState<boolean>(false);

  const stageDictKey = 'actionModules.register.stageMulti' as const;
  const dictionary = useTranslations(stageDictKey);
  const dictionaryGeneral = useTranslations('general');

  const {
    createOpenNode,
    openNodeContractAddress,
    contractCallStatus,
    simulateError,
    writeError,
    transactionError,
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
    if (contractCallStatus !== 'idle') return;
    setEnabled(false);
  };

  const createNodeContractErrorMessage = useMemo(
    () =>
      formatAndHandleLocalizedContractErrorMessages({
        parentDictKey: stageDictKey,
        errorGroupDictKey: 'create',
        dictionary,
        dictionaryGeneral,
        simulateError: simulateError,
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
    openNodeContractAddress,
    createOpenNodeContract,
    resetCreateOpenNodeContract,
    createNodeContractErrorMessage,
    createNodeContractStatus,
    enabled,
  };
}
