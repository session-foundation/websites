'use client';

import { useProxyApproval } from '@session/contracts/hooks/SENT';
import { useEffect, useMemo, useState } from 'react';
import {
  formatAndHandleLocalizedContractErrorMessages,
  parseContractStatusToProgressStatus,
} from '@/lib/contracts';
import { useTranslations } from 'next-intl';
import { useContributeFunds } from '@session/contracts/hooks/ServiceNodeContribution';
import type { Address } from 'viem';

export default function useContributeStakeToOpenNode({
  stakeAmount,
  userAddress,
  beneficiary,
  contractAddress,
}: {
  stakeAmount: bigint;
  userAddress: Address;
  beneficiary?: Address;
  contractAddress: Address | null;
}) {
  const [enabled, setEnabled] = useState<boolean>(false);

  const stageDictKey = 'actionModules.register.stageMulti' as const;
  const dictionary = useTranslations(stageDictKey);
  const dictionaryGeneral = useTranslations('general');

  const {
    approve,
    approveWrite,
    resetApprove,
    status: approveWriteStatusRaw,
    readStatus,
    writeError: approveWriteError,
    simulateError: approveSimulateError,
    transactionError: approveTransactionError,
  } = useProxyApproval({
    // TODO: Create network provider to handle network specific logic
    contractAddress,
    tokenAmount: stakeAmount,
  });

  const {
    contributeFunds,
    contractCallStatus: contributeFundsStatusRaw,
    simulateError: contributeFundsSimulateError,
    writeError: contributeFundsWriteError,
    transactionError: contributeFundsTransactionError,
  } = useContributeFunds({
    amount: stakeAmount,
    beneficiary: beneficiary ?? userAddress,
  });

  const contributeStake = () => {
    setEnabled(true);
    approve();
  };

  const resetContributeStake = () => {
    if (contributeFundsStatusRaw !== 'idle') return;
    setEnabled(false);
    resetApprove();
    approveWrite();
  };

  const approveErrorMessage = useMemo(
    () =>
      formatAndHandleLocalizedContractErrorMessages({
        parentDictKey: stageDictKey,
        errorGroupDictKey: 'approve',
        dictionary,
        dictionaryGeneral,
        simulateError: approveSimulateError,
        writeError: approveWriteError,
        transactionError: approveTransactionError,
      }),
    [approveSimulateError, approveWriteError, approveTransactionError]
  );

  const contributeFundsErrorMessage = useMemo(
    () =>
      formatAndHandleLocalizedContractErrorMessages({
        parentDictKey: stageDictKey,
        errorGroupDictKey: 'contribute',
        dictionary,
        dictionaryGeneral,
        simulateError: contributeFundsSimulateError,
        writeError: contributeFundsWriteError,
        transactionError: contributeFundsTransactionError,
      }),
    [contributeFundsSimulateError, contributeFundsWriteError, contributeFundsTransactionError]
  );

  const allowanceReadStatus = useMemo(
    () => parseContractStatusToProgressStatus(readStatus),
    [readStatus]
  );

  const approveWriteStatus = useMemo(
    () => parseContractStatusToProgressStatus(approveWriteStatusRaw),
    [approveWriteStatusRaw]
  );

  const contributeFundsStatus = useMemo(
    () => parseContractStatusToProgressStatus(contributeFundsStatusRaw),
    [contributeFundsStatusRaw]
  );

  // NOTE: Automatically triggers the write stage once the approval has succeeded
  useEffect(() => {
    if (enabled && approveWriteStatusRaw === 'success' && contractAddress) {
      contributeFunds(contractAddress);
    }
  }, [enabled, approveWriteStatusRaw, contractAddress]);

  return {
    contributeStake,
    resetContributeStake,
    allowanceReadStatus,
    approveWriteStatus,
    approveErrorMessage,
    contributeFundsErrorMessage,
    contributeFundsStatus,
    enabled,
  };
}
