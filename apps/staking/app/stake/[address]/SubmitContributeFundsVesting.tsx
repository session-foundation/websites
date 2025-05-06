import { recoverableErrors } from '@/app/register/[nodeId]/shared/ErrorTab';
import type { UseContributeStakeToOpenNodeParams } from '@/hooks/useContributeStakeToOpenNode';
import useContributeStakeToOpenNodeVesting from '@/hooks/useContributeStakeToOpenNodeVesting';
import { useActiveVestingContractAddress } from '@/providers/vesting-provider';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { getContractErrorName } from '@session/contracts';
import Typography from '@session/ui/components/Typography';
import { cn } from '@session/ui/lib/utils';
import { PROGRESS_STATUS, Progress } from '@session/ui/motion/progress';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';
import { type Dispatch, type SetStateAction, useEffect } from 'react';

export function SubmitContributeFundsVesting({
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

  const vestingContractAddress = useActiveVestingContractAddress();

  const {
    contributeStake,
    resetContributeStake,
    contributeFundsStatus,
    contributeFundsErrorMessage,
    contributeFundsSimulateError,
    contributeFundsWriteError,
    contributeFundsTransactionError,
  } = useContributeStakeToOpenNodeVesting({
    ...stakingParams,
    vestingContractAddress,
  });

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
      contributeFundsTransactionError ?? contributeFundsWriteError ?? contributeFundsSimulateError;

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

  const isError = contributeFundsStatus === PROGRESS_STATUS.ERROR;

  const handleRetry = () => {
    setIsSubmitting(true);
    resetContributeStake();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: On simulate status change
  useEffect(() => {
    if (!stakingParams.contractAddress) throw new Error('Contract address is not defined');
    contributeStake(stakingParams.contractAddress);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: On error
  useEffect(() => {
    if (isError) {
      handleError();
    }
  }, [isError]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: On success
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
              [PROGRESS_STATUS.IDLE]: dict('contribute.idle'),
              [PROGRESS_STATUS.PENDING]: dict('contribute.pending'),
              [PROGRESS_STATUS.SUCCESS]: dict('contribute.success'),
              [PROGRESS_STATUS.ERROR]: contributeFundsErrorMessage,
            },
            status: contributeFundsStatus,
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
