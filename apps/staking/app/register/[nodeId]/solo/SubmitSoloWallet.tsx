import { useSubmitSolo } from '@/app/register/[nodeId]/solo/useSubmitSolo';
import useRegisterNode, { type UseRegisterNodeParams } from '@/hooks/useRegisterNode';
import { SESSION_NODE } from '@/lib/constants';
import { CONFIRMATION_TYPE, useNodesWithConfirmations } from '@/lib/volatile-storage';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import type { Ed25519PublicKey } from '@session/staking-api-js/refine';
import Typography from '@session/ui/components/Typography';
import { cn } from '@session/ui/lib/utils';
import { PROGRESS_STATUS, Progress } from '@session/ui/motion/progress';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

export function SubmitSoloWallet({ params }: { params: UseRegisterNodeParams }) {
  const dict = useTranslations('actionModules.registration.submitSolo');
  const dictShared = useTranslations('actionModules.shared');

  const {
    registerAndStake,
    resetRegisterAndStake,
    enabled,
    allowanceReadStatus,
    approveWriteStatus,
    addBLSStatus,
    approveErrorMessage,
    addBLSErrorMessage,
    approveWriteError,
    approveSimulateError,
    approveTransactionError,
    addBLSSimulateError,
    addBLSWriteError,
    addBLSTransactionError,
  } = useRegisterNode(params);

  const isError =
    allowanceReadStatus === PROGRESS_STATUS.ERROR ||
    approveWriteStatus === PROGRESS_STATUS.ERROR ||
    addBLSStatus === PROGRESS_STATUS.ERROR;

  const { addConfirmingNode } = useNodesWithConfirmations();

  const { confirmations, remainingTimeEst, handleRetry } = useSubmitSolo({
    error:
      addBLSTransactionError ??
      addBLSWriteError ??
      addBLSSimulateError ??
      approveTransactionError ??
      approveWriteError ??
      approveSimulateError,
    enabled,
    isError,
    registerAndStake,
    resetRegisterAndStake,
  });

  useEffect(() => {
    if (addBLSStatus === PROGRESS_STATUS.SUCCESS) {
      const staker = params.contributors[0].staker;
      addConfirmingNode({
        pubkeyEd25519: params.nodePubKey as Ed25519PublicKey,
        pubkeyBls: params.blsPubKey,
        rewardsAddress: staker.beneficiary,
        operatorAddress: staker.addr,
        confirmationType: CONFIRMATION_TYPE.REGISTRATION,
        estimatedConfirmationTimestampMs:
          Date.now() + SESSION_NODE.NETWORK_CONFIRMATION_TIME_AVG_MS,
      });
    }
  }, [addBLSStatus, params, addConfirmingNode]);

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
              [PROGRESS_STATUS.IDLE]: dict('arbitrum.idle'),
              [PROGRESS_STATUS.PENDING]: dict('arbitrum.pending'),
              [PROGRESS_STATUS.SUCCESS]: dict('arbitrum.success'),
              [PROGRESS_STATUS.ERROR]: addBLSErrorMessage,
            },
            status: Math.min(
              addBLSStatus,
              Math.max(allowanceReadStatus, PROGRESS_STATUS.IDLE),
              Math.max(approveWriteStatus, PROGRESS_STATUS.IDLE)
            ),
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
