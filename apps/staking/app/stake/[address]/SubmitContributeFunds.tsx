import { recoverableErrors } from '@/app/register/[nodeId]/shared/ErrorTab';
import { WalletInteractionButtonWithLocales } from '@/components/WalletInteractionButtonWithLocales';
import useContributeStakeToOpenNode, {
  type UseContributeStakeToOpenNodeParams,
} from '@/hooks/useContributeStakeToOpenNode';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { getContractErrorName } from '@session/contracts';
import Typography from '@session/ui/components/Typography';
import { cn } from '@session/ui/lib/utils';
import { PROGRESS_STATUS, Progress } from '@session/ui/motion/progress';
import { useTranslations } from 'next-intl';
import { type Dispatch, type SetStateAction, useEffect } from 'react';

export function SubmitContributeFunds({
  stakingParams,
  setIsSubmitting,
  refetch,
}: {
  stakingParams: UseContributeStakeToOpenNodeParams;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  refetch: () => void;
}) {
  const dict = useTranslations('actionModules.registration.submitMulti');
  const dictShared = useTranslations('actionModules.shared');

  const {
    contributeStake,
    resetContributeStake,
    enabled: isContributeStakeEnabled,
    allowanceReadStatus,
    approveWriteStatus,
    contributeFundsStatus,
    approveErrorMessage,
    contributeFundsErrorMessage,
    approveWriteError,
    approveSimulateError,
    approveTransactionError,
    contributeFundsSimulateError,
    contributeFundsWriteError,
    contributeFundsTransactionError,
  } = useContributeStakeToOpenNode(stakingParams);

  /**
   * If an error is thrown by this function that error is caught by the ErrorBoundary and handled there.
   * If no error is thrown we treat the error as "recoverable", allowing a retry.
   *
   * Errors should be thrown if there is no way for the user to recover from the error, or no way
   * to recover from the error programmatically.
   */
  const handleError = () => {
    setIsSubmitting(false);

    const contractError =
      contributeFundsTransactionError ??
      contributeFundsWriteError ??
      contributeFundsSimulateError ??
      approveTransactionError ??
      approveWriteError ??
      approveSimulateError;

    /**
     * If there is a contract error, and it isn't explicitly recoverable, it will be thrown as unrecoverable.
     */
    if (contractError) {
      const name = getContractErrorName(contractError);

      if (recoverableErrors.has(name)) {
        return;
      }

      throw contractError;
    }
  };

  const isError =
    allowanceReadStatus === PROGRESS_STATUS.ERROR || approveWriteStatus === PROGRESS_STATUS.ERROR;

  const handleRetry = () => {
    setIsSubmitting(true);
    resetContributeStake();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies(contributeStake): On simulate status change
  useEffect(() => {
    if (!isContributeStakeEnabled) {
      contributeStake();
    }
  }, [isContributeStakeEnabled]);

  // biome-ignore lint/correctness/useExhaustiveDependencies(handleError): On error
  useEffect(() => {
    if (isError) {
      handleError();
    }
  }, [isError]);

  // biome-ignore lint/correctness/useExhaustiveDependencies(refetch): On success
  useEffect(() => {
    if (contributeFundsStatus === PROGRESS_STATUS.SUCCESS) {
      refetch();
    }
  }, [contributeFundsStatus]);

  return (
    <div>
      <Typography variant="h3" className="text-start">
        {dictShared('progress')}
      </Typography>
      <Progress
        steps={[
          {
            text: {
              [PROGRESS_STATUS.IDLE]: dict('approve.idle'),
              [PROGRESS_STATUS.PENDING]: dict('approve.pending'),
              [PROGRESS_STATUS.SUCCESS]: dict('approve.success'),
              [PROGRESS_STATUS.ERROR]: approveErrorMessage,
            },
            status: Math.min(allowanceReadStatus, approveWriteStatus),
          },
          {
            text: {
              [PROGRESS_STATUS.IDLE]: dict('contribute.idle'),
              [PROGRESS_STATUS.PENDING]: dict('contribute.pending'),
              [PROGRESS_STATUS.SUCCESS]: dict('contribute.success'),
              [PROGRESS_STATUS.ERROR]: contributeFundsErrorMessage,
            },
            status: Math.min(
              contributeFundsStatus,
              Math.max(allowanceReadStatus, PROGRESS_STATUS.IDLE),
              Math.max(approveWriteStatus, PROGRESS_STATUS.IDLE)
            ),
          },
        ]}
      />
      <WalletInteractionButtonWithLocales
        className={cn('w-full', !isError && 'hidden')}
        disabled={!isError}
        variant="outline"
        onClick={handleRetry}
        data-testid={ButtonDataTestId.Stake_Submit_Retry}
      >
        {dictShared('retry')}
      </WalletInteractionButtonWithLocales>
    </div>
  );
}
