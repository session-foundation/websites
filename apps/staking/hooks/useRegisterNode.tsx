'use client';

import { SESSION_NODE_FULL_STAKE_AMOUNT } from '@/lib/constants';
import {
  formatAndHandleLocalizedContractErrorMessages,
  parseContractStatusToProgressStatus,
} from '@/lib/contracts';
import { addresses, isValidChainId } from '@session/contracts';
import { useProxyApproval } from '@session/contracts/hooks/SENT';
import {
  type RegisterNodeContributor,
  useAddBLSPubKey,
} from '@session/contracts/hooks/ServiceNodeRewards';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

export type UseRegisterNodeParams = {
  blsPubKey: string;
  blsSignature: string;
  nodePubKey: string;
  userSignature: string;
  contributors?: Array<RegisterNodeContributor>;
};

export default function useRegisterNode({
  blsPubKey,
  blsSignature,
  nodePubKey,
  userSignature,
  contributors = [],
}: UseRegisterNodeParams) {
  const [enabled, setEnabled] = useState<boolean>(false);
  const { chainId } = useWallet();

  const dict = useTranslations('actionModules.registration.submitSolo');
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
    contractAddress: isValidChainId(chainId) ? addresses.ServiceNodeRewards[chainId] : null,
    tokenAmount: contributors[0]?.stakedAmount ?? SESSION_NODE_FULL_STAKE_AMOUNT,
    gcTime: Number.POSITIVE_INFINITY,
  });

  const {
    addBLSPubKey,
    contractCallStatus: addBLSStatusRaw,
    simulateError: addBLSSimulateError,
    writeError: addBLSWriteError,
    transactionError: addBLSTransactionError,
  } = useAddBLSPubKey({
    blsPubKey,
    blsSignature,
    nodePubKey,
    userSignature,
    contributors,
  });

  const registerAndStake = () => {
    setEnabled(true);
    approve();
  };

  const resetRegisterAndStake = () => {
    if (addBLSStatusRaw !== 'idle') return;
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
    [addBLSSimulateError, addBLSWriteError, addBLSTransactionError]
  );

  const allowanceReadStatus = useMemo(
    () => parseContractStatusToProgressStatus(readStatus),
    [readStatus]
  );

  const approveWriteStatus = useMemo(
    () => parseContractStatusToProgressStatus(approveWriteStatusRaw),
    [approveWriteStatusRaw]
  );

  const addBLSStatus = useMemo(
    () => parseContractStatusToProgressStatus(addBLSStatusRaw),
    [addBLSStatusRaw]
  );

  // NOTE: Automatically triggers the write stage once the approval has succeeded
  useEffect(() => {
    if (enabled && approveWriteStatusRaw === 'success') {
      addBLSPubKey();
    }
  }, [enabled, approveWriteStatusRaw]);

  return {
    registerAndStake,
    resetRegisterAndStake,
    allowanceReadStatus,
    approveWriteStatus,
    approveErrorMessage,
    addBLSErrorMessage,
    addBLSStatus,
    enabled,
    approveWriteError,
    approveSimulateError,
    approveTransactionError,
    addBLSSimulateError,
    addBLSWriteError,
    addBLSTransactionError,
  };
}
