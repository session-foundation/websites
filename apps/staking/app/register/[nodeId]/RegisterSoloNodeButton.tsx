import { Progress, PROGRESS_STATUS } from '@session/ui/motion/progress';
import { useTranslations } from 'next-intl';
import { SESSION_NODE_FULL_STAKE_AMOUNT } from '@/lib/constants';
import { formatSENTBigInt } from '@session/contracts/hooks/SENT';
import * as React from 'react';
import { useEffect, useMemo } from 'react';
import useRegisterNode from '@/hooks/useRegisterNode';
import { toast } from '@session/ui/lib/toast';
import { RegistrationPausedInfo } from '@/components/RegistrationPausedInfo';
import { Button } from '@session/ui/ui/button';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Tooltip } from '@session/ui/ui/tooltip';

type RegisterSoloNodeButtonProps = {
  blsPubKey: string;
  blsSignature: string;
  className: string;
  disabled?: boolean;
  isRegistrationPausedFlagEnabled?: boolean;
  isSolo: boolean;
  nodePubKey: string;
  setSoloStatus: (status: PROGRESS_STATUS) => void;
  userSignature: string;
};

export function RegisterSoloNodeButton({
  blsPubKey,
  blsSignature,
  className,
  disabled,
  isRegistrationPausedFlagEnabled,
  isSolo,
  nodePubKey,
  setSoloStatus,
  userSignature,
}: RegisterSoloNodeButtonProps) {
  const dictionary = useTranslations('actionModules.register');
  const dictionaryStage = useTranslations('actionModules.register.stageSolo');

  const stakeAmount = SESSION_NODE_FULL_STAKE_AMOUNT;
  const stakeAmountString = formatSENTBigInt(stakeAmount, 0);

  const registerNodeArgs = useMemo(
    () => ({
      blsPubKey,
      blsSignature,
      nodePubKey,
      userSignature,
      stakeAmount,
    }),
    [blsPubKey, blsSignature, nodePubKey, userSignature]
  );

  const {
    registerAndStake,
    resetRegisterAndStake,
    enabled,
    allowanceReadStatus,
    approveWriteStatus,
    addBLSStatus,
    approveErrorMessage,
    addBLSErrorMessage,
  } = useRegisterNode(registerNodeArgs);

  const handleClick = () => {
    if (isRegistrationPausedFlagEnabled) {
      toast.error(<RegistrationPausedInfo />);
    } else {
      if (enabled) {
        resetRegisterAndStake();
        registerAndStake();
      } else {
        setSoloStatus(PROGRESS_STATUS.PENDING);
        registerAndStake();
      }
    }
  };

  const tokenAmount = formatSENTBigInt(stakeAmount);

  useEffect(() => {
    if (
      [allowanceReadStatus, approveWriteStatus, addBLSStatus].some(
        (status) => status === PROGRESS_STATUS.ERROR
      )
    ) {
      setSoloStatus(PROGRESS_STATUS.ERROR);
    }
  }, [allowanceReadStatus, approveWriteStatus, addBLSStatus]);

  return (
    <>
      {isSolo ? (
        <Button
          className={className}
          data-testid={ButtonDataTestId.Register_Submit_Solo}
          rounded="lg"
          size="lg"
          onClick={handleClick}
          disabled={disabled || addBLSStatus !== PROGRESS_STATUS.IDLE}
        >
          {dictionary('button.submitSolo', { amount: stakeAmountString })}
        </Button>
      ) : (
        <Tooltip tooltipContent={dictionary('button.submitSoloDisabledNotSolo')}>
          <div className={className}>
            <Button
              data-testid={ButtonDataTestId.Register_Submit_Solo}
              rounded="lg"
              size="lg"
              onClick={handleClick}
              disabled
              className="w-full"
            >
              {dictionary('button.submitSolo', { amount: stakeAmountString })}
            </Button>
          </div>
        </Tooltip>
      )}
      {isSolo && enabled ? (
        <Progress
          steps={[
            {
              text: {
                [PROGRESS_STATUS.IDLE]: dictionaryStage('validate.idle', { tokenAmount }),
                [PROGRESS_STATUS.PENDING]: dictionaryStage('validate.pending', {
                  tokenAmount,
                }),
                [PROGRESS_STATUS.SUCCESS]: dictionaryStage('validate.success', {
                  tokenAmount,
                }),
                [PROGRESS_STATUS.ERROR]: approveErrorMessage,
              },
              status: allowanceReadStatus,
            },
            {
              text: {
                [PROGRESS_STATUS.IDLE]: dictionaryStage('approve.idle', { tokenAmount }),
                [PROGRESS_STATUS.PENDING]: dictionaryStage('approve.pending', {
                  tokenAmount,
                }),
                [PROGRESS_STATUS.SUCCESS]: dictionaryStage('approve.success'),
                [PROGRESS_STATUS.ERROR]: approveErrorMessage,
              },
              status: approveWriteStatus,
            },
            {
              text: {
                [PROGRESS_STATUS.IDLE]: dictionaryStage('arbitrum.idle'),
                [PROGRESS_STATUS.PENDING]: dictionaryStage('arbitrum.pending'),
                [PROGRESS_STATUS.SUCCESS]: dictionaryStage('arbitrum.success'),
                [PROGRESS_STATUS.ERROR]: addBLSErrorMessage,
              },
              status: addBLSStatus,
            },
            {
              text: {
                [PROGRESS_STATUS.IDLE]: dictionaryStage('network.idle'),
                [PROGRESS_STATUS.PENDING]: dictionaryStage('network.pending'),
                [PROGRESS_STATUS.SUCCESS]: dictionaryStage('network.success'),
                [PROGRESS_STATUS.ERROR]: addBLSErrorMessage,
              },
              status:
                addBLSStatus === PROGRESS_STATUS.SUCCESS
                  ? PROGRESS_STATUS.SUCCESS
                  : PROGRESS_STATUS.IDLE,
            },
          ]}
        />
      ) : null}
    </>
  );
}
