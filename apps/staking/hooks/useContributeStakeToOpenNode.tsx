'use client';

import {
  formatAndHandleLocalizedContractErrorMessages,
  parseContractStatusToProgressStatus,
} from '@/lib/contracts';
import { useProxyApproval } from '@session/contracts/hooks/Token';
import { useContributeFunds } from '@session/contracts/hooks/ServiceNodeContribution';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import type { Address } from 'viem';

export type UseContributeStakeToOpenNodeParams = {
  stakeAmount: bigint;
  userAddress: Address;
  beneficiary?: Address;
  contractAddress: Address | null;
};

export default function useContributeStakeToOpenNode({
  stakeAmount,
  userAddress,
  beneficiary,
  contractAddress,
}: UseContributeStakeToOpenNodeParams) {
  const [enabled, setEnabled] = useState<boolean>(false);

  const dict = useTranslations('actionModules.registration.submitMulti');
  const dictGeneral = useTranslations('general');

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
    gcTime: Number.POSITIVE_INFINITY,
  });

  const {
    contributeFunds,
    contractCallStatus: contributeFundsStatusRaw,
    simulateError: contributeFundsSimulateError,
    writeError: contributeFundsWriteError,
    transactionError: contributeFundsTransactionError,
  } = useContributeFunds({
    amount: stakeAmount,
    beneficiary: beneficiary || userAddress,
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
        errorGroupDictKey: 'approve',
        dict,
        dictGeneral,
        simulateError: approveSimulateError,
        writeError: approveWriteError,
        transactionError: approveTransactionError,
      }),
    [approveSimulateError, approveWriteError, approveTransactionError]
  );

  const contributeFundsErrorMessage = useMemo(
    () =>
      formatAndHandleLocalizedContractErrorMessages({
        errorGroupDictKey: 'contribute',
        dict,
        dictGeneral,
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
    approveWriteError,
    approveSimulateError,
    approveTransactionError,
    contributeFundsSimulateError,
    contributeFundsWriteError,
    contributeFundsTransactionError,
  };
}
