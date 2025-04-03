'use client';

import type { UseContributeStakeToOpenNodeParams } from '@/hooks/useContributeStakeToOpenNode';
import {
  formatAndHandleLocalizedContractErrorMessages,
  parseContractStatusToProgressStatus,
} from '@/lib/contracts';
import { useVestingContributeFunds } from '@session/contracts/hooks/TokenVestingStaking';
import { areHexesEqual } from '@session/util-crypto/string';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import type { Address } from 'viem';

export type UseContributeStakeToOpenNodeVestingParams = Omit<
  UseContributeStakeToOpenNodeParams,
  'contractAddress'
> & {
  vestingContractAddress?: Address;
};

/**
 * Hook to contribute to a multicontributor contract. This is a wrapper method on a vesting contract that executes
 * the contribution flow and interacts with the multicontributor contract.
 *
 * NOTE: the contribution contract address is passed in as an argument to the contract call function.
 *
 * @param stakeAmount - The amount of stake to contribute.
 * @param beneficiary - The rewards beneficiary address.
 * @param vestingContractAddress - The vesting contract address to stake from.
 * @returns The contribute stake to open node hook.
 */
export default function useContributeStakeToOpenNodeVesting({
  stakeAmount,
  beneficiary,
  vestingContractAddress,
}: UseContributeStakeToOpenNodeVestingParams) {
  const dict = useTranslations('actionModules.registration.submitMulti');
  const dictGeneral = useTranslations('general');

  // These assertions are a final guard against accidentally passing in the vesting contract address as the beneficiary
  if (!beneficiary) {
    throw new Error('Beneficiary is required for vesting contracts');
  }

  if (areHexesEqual(beneficiary, vestingContractAddress)) {
    throw new Error('Beneficiary cannot be the vesting contract address');
  }

  const {
    contributeFunds,
    resetContract,
    contractCallStatus: contributeFundsStatusRaw,
    simulateError: contributeFundsSimulateError,
    writeError: contributeFundsWriteError,
    transactionError: contributeFundsTransactionError,
  } = useVestingContributeFunds({
    amount: stakeAmount,
    beneficiary,
    vestingContractAddress,
  });

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

  const contributeFundsStatus = useMemo(
    () => parseContractStatusToProgressStatus(contributeFundsStatusRaw),
    [contributeFundsStatusRaw]
  );

  return {
    contributeStake: contributeFunds,
    resetContributeStake: resetContract,
    contributeFundsErrorMessage,
    contributeFundsStatus,
    contributeFundsSimulateError,
    contributeFundsWriteError,
    contributeFundsTransactionError,
  };
}
