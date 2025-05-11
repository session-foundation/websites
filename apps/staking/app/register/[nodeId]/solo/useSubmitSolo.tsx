import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { recoverableErrors } from '@/app/register/[nodeId]/shared/ErrorTab';
import { useConfirmationProgress } from '@/app/register/[nodeId]/solo/SubmitSoloTab';
import { REG_TAB } from '@/app/register/[nodeId]/types';
import { SESSION_NODE } from '@/lib/constants';
import { getContractErrorName } from '@session/contracts';
import { useMount } from '@session/util-react/hooks/useMount';
import { useEffect } from 'react';

type SubmitSoloProps = {
  error?: Error | null;
  enabled: boolean;
  isError: boolean;
  registerAndStake: () => void;
  resetRegisterAndStake: () => void;
  beginConfirmationTracking: boolean;
};

export function useSubmitSolo({
  error,
  enabled,
  isError,
  resetRegisterAndStake,
  registerAndStake,
  beginConfirmationTracking,
}: SubmitSoloProps) {
  const { setIsSubmitting, setIsSuccess, changeTab, setIsError } = useRegistrationWizard();

  const {
    confirmations,
    remainingTimeEst,
    start: startConfirmationTracking,
  } = useConfirmationProgress();

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

  useMount(() => {
    if (!enabled) {
      setIsSubmitting(true);
      registerAndStake();
    }
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies(startConfirmationTracking): On status change
  useEffect(() => {
    if (beginConfirmationTracking) {
      startConfirmationTracking();
    }
  }, [beginConfirmationTracking]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: On confirmation change
  useEffect(() => {
    if (confirmations >= SESSION_NODE.GOAL_REGISTRATION_CONFIRMATIONS) {
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
  };
}
