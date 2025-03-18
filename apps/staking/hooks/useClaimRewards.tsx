'use client';

import { getContractErrorName } from '@session/contracts';
import {
  type UseUpdateRewardsBalanceQueryParams,
  useClaimRewardsQuery,
  useUpdateRewardsBalanceQuery,
} from '@session/contracts/hooks/ServiceNodeRewards';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import {
  formatAndHandleLocalizedContractErrorMessages,
  parseContractStatusToProgressStatus,
} from '@/lib/contracts';

type UseClaimRewardsParams = UseUpdateRewardsBalanceQueryParams;

export default function useClaimRewards({
  address,
  rewards,
  blsSignature,
  excludedSigners,
}: UseClaimRewardsParams) {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [skipUpdateBalance, setSkipUpdateBalance] = useState<boolean>(false);

  const stageDictKey = 'modules.claim.stage' as const;
  const dict = useTranslations(stageDictKey);
  const dictGeneral = useTranslations('general');

  const {
    updateRewardsBalance,
    fee: updateBalanceFee,
    gasPrice: updateBalanceGasPrice,
    gasAmount: updateBalanceGasAmountEstimate,
    contractCallStatus: updateBalanceContractCallStatus,
    transactionStatus: updateBalanceTransactionStatus,
    estimateFeeError: updateBalanceEstimateFeeError,
    simulateError: updateBalanceSimulateError,
    writeError: updateBalanceWriteError,
    transactionError: updateBalanceTransactionError,
  } = useUpdateRewardsBalanceQuery({ address, rewards, blsSignature, excludedSigners });

  const {
    claimRewards,
    fee: claimFee,
    gasPrice: claimGasPrice,
    gasAmount: claimGasAmountEstimate,
    contractCallStatus: claimContractCallStatus,
    simulateError: claimSimulateError,
    writeError: claimWriteError,
    transactionError: claimTransactionError,
  } = useClaimRewardsQuery();

  const updateRewardsBalanceStatus = useMemo(
    () => parseContractStatusToProgressStatus(updateBalanceContractCallStatus),
    [updateBalanceContractCallStatus]
  );

  const claimRewardsStatus = useMemo(
    () => parseContractStatusToProgressStatus(claimContractCallStatus),
    [claimContractCallStatus]
  );

  const updateBalanceAndClaimRewards = () => {
    setEnabled(true);
    if (!skipUpdateBalance) {
      updateRewardsBalance();
    }
  };

  const updateRewardsBalanceErrorMessage = useMemo(
    () =>
      formatAndHandleLocalizedContractErrorMessages({
        errorGroupDictKey: 'balance',
        dict,
        dictGeneral,
        simulateError: updateBalanceSimulateError,
        writeError: updateBalanceWriteError,
        transactionError: updateBalanceTransactionError,
      }),
    [
      updateBalanceSimulateError,
      updateBalanceWriteError,
      updateBalanceTransactionError,
      dict,
      dictGeneral,
    ]
  );

  const claimRewardsErrorMessage = useMemo(
    () =>
      formatAndHandleLocalizedContractErrorMessages({
        errorGroupDictKey: 'claim',
        dict,
        dictGeneral,
        simulateError: claimSimulateError,
        writeError: claimWriteError,
        transactionError: claimTransactionError,
      }),
    [claimSimulateError, claimWriteError, claimTransactionError, dict, dictGeneral]
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only trigger on success
  useEffect(() => {
    if (enabled && (skipUpdateBalance || updateBalanceTransactionStatus === 'success')) {
      claimRewards();
    }
  }, [enabled, skipUpdateBalance, updateBalanceTransactionStatus]);

  useEffect(() => {
    // If the gas estimation fails with the RecipientRewardsTooLow error, we can skip the update balance step
    if (
      updateBalanceEstimateFeeError &&
      getContractErrorName(updateBalanceEstimateFeeError) === 'RecipientRewardsTooLow'
    ) {
      setSkipUpdateBalance(true);
    }
  }, [updateBalanceEstimateFeeError]);

  return {
    updateBalanceAndClaimRewards,
    claimFee,
    claimGasPrice,
    claimGasAmountEstimate,
    updateBalanceFee,
    updateBalanceGasPrice,
    updateBalanceGasAmountEstimate,
    updateRewardsBalanceStatus,
    claimRewardsStatus,
    enabled,
    skipUpdateBalance,
    updateRewardsBalanceErrorMessage,
    claimRewardsErrorMessage,
  };
}
