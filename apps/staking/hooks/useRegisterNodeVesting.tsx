'use client';

import type { UseRegisterNodeParams } from '@/hooks/useRegisterNode';
import {
  formatAndHandleLocalizedContractErrorMessages,
  parseContractStatusToProgressStatus,
} from '@/lib/contracts';
import { useVestingAddBLSPubKey } from '@session/contracts/hooks/TokenVestingStaking';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import type { Address } from 'viem';

export type UseRegisterNodeVestingParams = Omit<UseRegisterNodeParams, 'contributors'> & {
  rewardsAddress: Address;
  vestingContractAddress: Address;
};

export default function useRegisterNodeVesting({
  blsPubKey,
  blsSignature,
  nodePubKey,
  userSignature,
  rewardsAddress,
  vestingContractAddress,
}: UseRegisterNodeVestingParams) {
  const [enabled, setEnabled] = useState<boolean>(false);

  const dict = useTranslations('actionModules.registration.submitSolo');
  const dictGeneral = useTranslations('general');

  const {
    addBLSPubKey,
    resetContract,
    contractCallStatus: addBLSStatusRaw,
    simulateError: addBLSSimulateError,
    writeError: addBLSWriteError,
    transactionError: addBLSTransactionError,
  } = useVestingAddBLSPubKey({
    blsPubKey,
    blsSignature,
    nodePubKey,
    userSignature,
    rewardsAddress,
    vestingContractAddress,
  });

  const registerAndStake = () => {
    setEnabled(true);
    addBLSPubKey();
  };

  const resetRegisterAndStake = () => {
    if (addBLSStatusRaw !== 'idle') return;
    setEnabled(false);
    resetContract();
  };

  const addBLSErrorMessage = useMemo(
    () =>
      formatAndHandleLocalizedContractErrorMessages({
        errorGroupDictKey: 'arbitrum',
        dict,
        dictGeneral,
        simulateError: addBLSSimulateError,
        writeError: addBLSWriteError,
        transactionError: addBLSTransactionError,
      }),
    [addBLSSimulateError, addBLSWriteError, addBLSTransactionError, dict, dictGeneral]
  );

  const addBLSStatus = useMemo(
    () => parseContractStatusToProgressStatus(addBLSStatusRaw),
    [addBLSStatusRaw]
  );

  return {
    registerAndStake,
    resetRegisterAndStake,
    addBLSErrorMessage,
    addBLSStatus,
    enabled,
    addBLSSimulateError,
    addBLSWriteError,
    addBLSTransactionError,
  };
}
