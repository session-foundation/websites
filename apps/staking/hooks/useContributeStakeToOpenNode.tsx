'use client';

import {
  formatAndHandleLocalizedContractErrorMessages,
  parseContractStatusToProgressStatus,
} from '@/lib/contracts';
import { useContributeFunds } from '@session/contracts/hooks/ServiceNodeContribution';
import { useProxyApproval } from '@session/contracts/hooks/Token';
import {
  type ContributionContract,
  contributionContractSchema,
} from '@session/staking-api-js/schema';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import type { Address } from 'viem';

/**
 * Filters out the contracts that are not ready to be used.
 * @param contracts - The contracts to filter.
 * @returns The filtered contracts.
 */
export function getReadyContracts(contracts: Array<object>) {
  const readyContracts: Array<ContributionContract> = [];
  for (const contract of contracts) {
    if (contributionContractSchema.safeParse(contract).success) {
      // the safeParse assets the type, so we can safely cast
      readyContracts.push(contract as ContributionContract);
    }
  }
  return readyContracts;
}

export type UseContributeStakeToOpenNodeParams = {
  stakeAmount: bigint;
  userAddress: Address;
  beneficiary?: Address;
  contractAddress: Address | null;
};

/**
 * Hook to contribute to a multicontributor contract.
 * @param stakeAmount - The amount of stake to contribute.
 * @param userAddress - The user address.
 * @param beneficiary - The rewards beneficiary address.
 * @param contractAddress - The contract address to contribute to.
 * @returns The contribute stake to open node hook.
 */
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
    [approveSimulateError, approveWriteError, approveTransactionError, dict, dictGeneral]
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
    [
      contributeFundsSimulateError,
      contributeFundsWriteError,
      contributeFundsTransactionError,
      dict,
      dictGeneral,
    ]
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only trigger success or address change
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
