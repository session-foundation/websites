import {
  formatAndHandleLocalizedContractErrorMessages,
  parseContractStatusToProgressStatus,
} from '@/lib/contracts';
import { useActiveVestingContractAddress } from '@/providers/vesting-provider';
import { useInitiateRemoveBLSPublicKey } from '@session/contracts/hooks/ServiceNodeRewards';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

type UseRequestNodeExitParams = {
  contractId: number;
};

export default function useRequestNodeExit({ contractId }: UseRequestNodeExitParams) {
  const dict = useTranslations('nodeCard.staked.requestExit.dialog.stage');
  const dictGeneral = useTranslations('general');
  const vestingContractAddress = useActiveVestingContractAddress();

  const {
    initiateRemoveBLSPublicKey,
    fee,
    gasAmount,
    gasPrice,
    estimateContractWriteFee,
    contractCallStatus,
    simulateError,
    writeError,
    transactionError,
    simulateEnabled,
    resetContract,
  } = useInitiateRemoveBLSPublicKey({
    contractId,
    vestingContractAddress,
  });

  const errorMessage = useMemo(
    () =>
      formatAndHandleLocalizedContractErrorMessages({
        errorGroupDictKey: 'arbitrum',
        dict,
        dictGeneral,
        simulateError,
        writeError,
        transactionError,
      }),
    [simulateError, writeError, transactionError, dict, dictGeneral]
  );

  const status = useMemo(
    () => parseContractStatusToProgressStatus(contractCallStatus),
    [contractCallStatus]
  );

  return {
    initiateRemoveBLSPublicKey,
    fee,
    gasAmount,
    gasPrice,
    estimateContractWriteFee,
    simulateEnabled,
    resetContract,
    errorMessage,
    status,
  };
}
