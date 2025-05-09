import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { recoverableErrors } from '@/app/register/[nodeId]/shared/ErrorTab';
import { useConfirmationProgress } from '@/app/register/[nodeId]/solo/SubmitSoloTab';
import { REG_TAB } from '@/app/register/[nodeId]/types';
import { useCurrentActor } from '@/hooks/useCurrentActor';
import { SESSION_NODE } from '@/lib/constants';
import { useNodesWithConfirmations } from '@/lib/volatile-storage';
import { getContractErrorName } from '@session/contracts';
import { areHexesEqual } from '@session/util-crypto/string';
import { useEffect, useMemo, useState } from 'react';

type SubmitSoloProps = {
  error?: Error | null;
  enabled: boolean;
  isError: boolean;
  registerAndStake: () => void;
  resetRegisterAndStake: () => void;
};

export function useSubmitSolo({
  error,
  enabled,
  isError,
  resetRegisterAndStake,
  registerAndStake,
}: SubmitSoloProps) {
  const { setIsSubmitting, setIsSuccess, changeTab, setIsError, props } = useRegistrationWizard();
  const currentActor = useCurrentActor();
  const {
    nodes: { nodesConfirmingRegistration },
  } = useNodesWithConfirmations();

  const [confirmTimestampMs, setConfirmTimestampMs] = useState<number | null>(null);

  const confirmingNode = useMemo(
    () =>
      nodesConfirmingRegistration.find(
        (m) =>
          m.pubkeyEd25519 === props.ed25519PubKey && areHexesEqual(m.operatorAddress, currentActor)
      ),
    [props.ed25519PubKey, nodesConfirmingRegistration, currentActor]
  );

  const { confirmations, remainingTimeEst } = useConfirmationProgress(
    confirmingNode?.estimatedConfirmationTimestampMs ?? confirmTimestampMs
  );

  /**
   * If an error is thrown by this function that error is caught by the ErrorBoundary and handled there.
   * If no error is thrown we treat the error as "recoverable", allowing a retry.
   *
   * Errors should be thrown if there is no way for the user to recover from the error, or no way
   * to recover from the error programmatically.
   */
  const handleError = () => {
    setIsSubmitting(false);

    /**
     * If there is a contract error and it isn't explicitly recoverable, it will be thrown as unrecoverable.
     */
    if (error) {
      const name = getContractErrorName(error);

      if (recoverableErrors.has(name)) {
        return;
      }

      setIsError(true);
      throw error;
    }
  };

  const handleRetry = () => {
    resetRegisterAndStake();
    registerAndStake();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: On mount
  useEffect(() => {
    if (!enabled) {
      setIsSubmitting(true);
      registerAndStake();
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: On confirmation change
  useEffect(() => {
    if (confirmations >= SESSION_NODE.NETWORK_REQUIRED_CONFIRMATIONS) {
      setIsSubmitting(false);
      setIsSuccess(true);
      changeTab(REG_TAB.SUCCESS_SOLO);
    }
  }, [confirmations]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: On error
  useEffect(() => {
    if (isError) {
      handleError();
    }
  }, [isError]);

  return {
    remainingTimeEst,
    confirmations,
    handleRetry,
    setConfirmTimestampMs,
  };
}
