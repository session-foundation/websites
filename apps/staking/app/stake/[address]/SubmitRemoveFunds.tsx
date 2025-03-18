import { recoverableErrors } from '@/app/register/[nodeId]/shared/ErrorTab';
import {
  formatAndHandleLocalizedContractErrorMessages,
  parseContractStatusToProgressStatus,
} from '@/lib/contracts';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { getContractErrorName } from '@session/contracts';
import { useWithdrawContribution } from '@session/contracts/hooks/ServiceNodeContribution';
import Typography from '@session/ui/components/Typography';
import { cn } from '@session/ui/lib/utils';
import { PROGRESS_STATUS, Progress } from '@session/ui/motion/progress';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';
import { type Dispatch, type SetStateAction, useEffect, useMemo } from 'react';
import type { Address } from 'viem';

export function SubmitRemoveFunds({
  setIsSubmitting,
  contractAddress,
}: {
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  contractAddress: Address;
}) {
  const dict = useTranslations('actionModules.staking.manage');
  const dictShared = useTranslations('actionModules.shared');
  const dictGeneral = useTranslations('general');

  const {
    withdrawContribution,
    transactionError,
    simulateError,
    writeError,
    resetContract,
    simulateEnabled,
    contractCallStatus,
  } = useWithdrawContribution({ contractAddress });

  /**
   * If an error is thrown by this function that error is caught by the ErrorBoundary and handled there.
   * If no error is thrown we treat the error as "recoverable", allowing a retry.
   *
   * Errors should be thrown if there is no way for the user to recover from the error, or no way
   * to recover from the error programmatically.
   */
  const handleError = () => {
    setIsSubmitting(false);

    const contractError = transactionError ?? writeError ?? simulateError;

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

  const isError = contractCallStatus === 'error';

  const withdrawFundsErrorMessage = useMemo(
    () =>
      formatAndHandleLocalizedContractErrorMessages({
        errorGroupDictKey: 'withdrawContribution',
        dict,
        dictGeneral,
        simulateError: simulateError,
        writeError: writeError,
        transactionError: transactionError,
      }),
    [simulateError, writeError, transactionError, dict, dictGeneral]
  );

  const handleRetry = () => {
    setIsSubmitting(true);
    resetContract();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: On simulate status change
  useEffect(() => {
    if (!simulateEnabled) {
      withdrawContribution();
    }
  }, [simulateEnabled]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: On error
  useEffect(() => {
    if (isError) {
      handleError();
    }
  }, [isError]);

  return (
    <div>
      <Typography variant="h3" className="text-start">
        {dictShared('progress')}
      </Typography>
      <Progress
        steps={[
          {
            text: {
              [PROGRESS_STATUS.IDLE]: dict('withdrawContribution.idle'),
              [PROGRESS_STATUS.PENDING]: dict('withdrawContribution.pending'),
              [PROGRESS_STATUS.SUCCESS]: dict('withdrawContribution.success'),
              [PROGRESS_STATUS.ERROR]: withdrawFundsErrorMessage,
            },
            status: parseContractStatusToProgressStatus(contractCallStatus),
          },
        ]}
      />
      <Button
        className={cn('w-full', !isError && 'hidden')}
        disabled={!isError}
        variant="outline"
        onClick={handleRetry}
        data-testid={ButtonDataTestId.Stake_Submit_Retry}
      >
        {dictShared('retry')}
      </Button>
    </div>
  );
}
