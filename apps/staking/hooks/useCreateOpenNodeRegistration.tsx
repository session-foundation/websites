'use client';

import {
  formatAndHandleLocalizedContractErrorMessages,
  parseContractStatusToProgressStatus,
} from '@/lib/contracts';
import { useCreateOpenNode } from '@session/contracts/hooks/ServiceNodeContributionFactory';
import type { UseAddBlsPubKeyParams } from '@session/contracts/hooks/ServiceNodeRewards';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import type { Address } from 'viem';

export type ReservedContributorStruct = {
  addr: Address;
  amount: bigint;
};

export type UseCreateOpenNodeContractParams = Required<
  Omit<UseAddBlsPubKeyParams, 'contributors'>
> & {
  reservedContributors: Array<ReservedContributorStruct>;
  autoStart: boolean;
};

/**
 * Hook to create a new open node registration.
 * @param blsPubKey - The BLS public key of the node.
 * @param blsSignature - The BLS signature of the node.
 * @param nodePubKey - The node public key.
 * @param reservedContributors - The reserved contributors.
 * @param userSignature - The user signature.
 * @param fee - The operator fee.
 * @param autoStart - Whether the node should be automatically started.
 */
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
    [simulateError, writeError, transactionError, dict, dictGeneral]
  );

  const createNodeContractStatus = useMemo(
    () => parseContractStatusToProgressStatus(contractCallStatus),
    [contractCallStatus]
  );

  // NOTE: Automatically triggers the write stage once the approval has succeeded
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only trigger on enabled
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
