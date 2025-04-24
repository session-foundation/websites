import { useSubmitSolo } from '@/app/register/[nodeId]/solo/useSubmitSolo';
import type { UseRegisterNodeParams } from '@/hooks/useRegisterNode';
import useRegisterNodeVesting from '@/hooks/useRegisterNodeVesting';
import { useActiveVestingContractAddress } from '@/providers/vesting-provider';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import Typography from '@session/ui/components/Typography';
import { cn } from '@session/ui/lib/utils';
import { PROGRESS_STATUS, Progress } from '@session/ui/motion/progress';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { isAddress } from 'viem';

export function SubmitSoloVesting({ params }: { params: UseRegisterNodeParams }) {
  const dict = useTranslations('actionModules.registration.submitSolo');
  const dictShared = useTranslations('actionModules.shared');

  const vestingContractAddress = useActiveVestingContractAddress();

  const vestingParams = useMemo(() => {
    const rewardsAddress = params.contributors[0].staker.beneficiary;

    if (!rewardsAddress || !isAddress(rewardsAddress)) {
      throw new Error(
        `Rewards address is not a valid Ethereum address or is not set: ${rewardsAddress}`
      );
    }

    if (!vestingContractAddress || !isAddress(vestingContractAddress)) {
      throw new Error(
        `Vesting contract address is not a valid Ethereum address or is not set: ${vestingContractAddress}`
      );
    }

    return {
      blsPubKey: params.blsPubKey,
      blsSignature: params.blsSignature,
      nodePubKey: params.nodePubKey,
      userSignature: params.userSignature,
      rewardsAddress,
      vestingContractAddress: vestingContractAddress,
    };
  }, [params, vestingContractAddress]);

  const {
    registerAndStake,
    resetRegisterAndStake,
    enabled,
    addBLSStatus,
    addBLSErrorMessage,
    addBLSSimulateError,
    addBLSWriteError,
    addBLSTransactionError,
  } = useRegisterNodeVesting(vestingParams);

  const isError = addBLSStatus === PROGRESS_STATUS.ERROR;

  const { confirmations, remainingTimeEst, handleRetry } = useSubmitSolo({
    error: addBLSTransactionError ?? addBLSWriteError ?? addBLSSimulateError,
    enabled,
    isError,
    registerAndStake,
    resetRegisterAndStake,
  });

  return (
    <div>
      <Typography variant="h3" className="text-start">
        {dictShared('progress')}
      </Typography>
      <Progress
        steps={[
          {
            text: {
              [PROGRESS_STATUS.IDLE]: dict('arbitrum.idle'),
              [PROGRESS_STATUS.PENDING]: dict('arbitrum.pending'),
              [PROGRESS_STATUS.SUCCESS]: dict('arbitrum.success'),
              [PROGRESS_STATUS.ERROR]: addBLSErrorMessage,
            },
            status: addBLSStatus,
          },
          {
            text: {
              [PROGRESS_STATUS.IDLE]: dict('network.idle'),
              [PROGRESS_STATUS.PENDING]: dict('network.pending', {
                progress: `${confirmations}/5`,
                remainingTime: remainingTimeEst,
              }),
              [PROGRESS_STATUS.SUCCESS]: dict('network.success'),
              [PROGRESS_STATUS.ERROR]: addBLSErrorMessage,
            },
            status:
              addBLSStatus === PROGRESS_STATUS.SUCCESS
                ? PROGRESS_STATUS.PENDING
                : PROGRESS_STATUS.IDLE,
          },
        ]}
      />
      <Button
        className={cn('w-full', !isError && 'hidden')}
        disabled={!isError}
        variant="outline"
        onClick={handleRetry}
        data-testid={ButtonDataTestId.Register_Submit_Solo_Retry}
      >
        {dictShared('retry')}
      </Button>
    </div>
  );
}
