import { Progress, PROGRESS_STATUS } from '@session/ui/motion/progress';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import useContributeStakeToOpenNode from '@/hooks/useContributeStakeToOpenNode';
import { formatSENTBigIntNoRounding } from '@session/contracts/hooks/SENT';
import { Tooltip } from '@session/ui/ui/tooltip';
import { Button } from '@session/ui/ui/button';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import type { Address } from 'viem';
import type { ParsedStakeData } from '@/app/stake/[contract]/NodeStaking';
import { stringToBigInt } from '@session/util-crypto/maths';
import { SENT_DECIMALS } from '@session/contracts';
import { WalletButtonWithLocales } from '@/components/WalletButtonWithLocales';
import { useWallet } from '@session/wallet/hooks/useWallet';

type NodeStakingButtonProps = {
  disabled?: boolean;
  watchedStakeAmount: string;
  formData: ParsedStakeData | null;
  isOpenNodeContributionDisabled?: boolean;
  setMultiStatus: (status: PROGRESS_STATUS) => void;
  openNodeContractAddress: Address;
};

export function NodeStakingButton({
  disabled,
  watchedStakeAmount,
  formData,
  isOpenNodeContributionDisabled,
  setMultiStatus,
  openNodeContractAddress,
}: NodeStakingButtonProps) {
  const dictionary = useTranslations('actionModules.register');
  const dictionaryStage = useTranslations('actionModules.register.stageMulti');
  const { address, isConnected } = useWallet();

  const {
    contributeStake,
    resetContributeStake,
    enabled: isContributeStakeEnabled,
    allowanceReadStatus,
    approveWriteStatus,
    contributeFundsStatus,
    approveErrorMessage,
    contributeFundsErrorMessage,
  } = useContributeStakeToOpenNode({
    stakeAmount: formData?.stakeAmount ?? BigInt(0),
    userAddress: address!,
    beneficiary: formData?.beneficiaryAddress,
    contractAddress: openNodeContractAddress,
  });

  const formattedWatchedStakeAmount = formatSENTBigIntNoRounding(
    stringToBigInt(watchedStakeAmount, SENT_DECIMALS)
  );
  const tokenAmount = formatSENTBigIntNoRounding(formData?.stakeAmount);

  useEffect(() => {
    if (formData && !isOpenNodeContributionDisabled) {
      setMultiStatus(PROGRESS_STATUS.PENDING);
      if (isContributeStakeEnabled) {
        resetContributeStake();
      }
      contributeStake();
    }
  }, [formData, isOpenNodeContributionDisabled, isContributeStakeEnabled]);

  useEffect(() => {
    if (
      [allowanceReadStatus, approveWriteStatus, contributeFundsStatus].some(
        (status) => status === PROGRESS_STATUS.ERROR
      )
    ) {
      setMultiStatus(PROGRESS_STATUS.ERROR);
    }
  }, [allowanceReadStatus, approveWriteStatus, contributeFundsStatus]);

  return (
    <>
      {!isConnected ? (
        <WalletButtonWithLocales rounded="md" size="lg" className="items-center" type="button" />
      ) : !isOpenNodeContributionDisabled ? (
        <Button
          data-testid={ButtonDataTestId.Stake_Submit_Multi}
          rounded="lg"
          size="lg"
          type="submit"
          disabled={disabled || contributeFundsStatus !== PROGRESS_STATUS.IDLE}
        >
          {dictionary('button.submitMultiStake', { amount: formattedWatchedStakeAmount })}
        </Button>
      ) : (
        // TODO: Add tooltip buttons as a component because this is getting ridiculous. This current implementation is required as the tooltip mounts its events to the child, so if its a button its game over, hence the div sandwiched between the tooltip and button. (if the button is disabled it also disabled the tooltip which is annoying)
        <Tooltip tooltipContent={dictionary('button.submitMultiRegisterDisabledDescription')}>
          <div>
            <Button
              data-testid={ButtonDataTestId.Stake_Submit_Multi}
              rounded="lg"
              size="lg"
              type="submit"
              disabled
              className="w-full"
            >
              {dictionary('button.submitMultiStake', { amount: formattedWatchedStakeAmount })}
            </Button>
          </div>
        </Tooltip>
      )}
      {isContributeStakeEnabled ? (
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
                [PROGRESS_STATUS.IDLE]: dictionaryStage('contribute.idle', { tokenAmount }),
                [PROGRESS_STATUS.PENDING]: dictionaryStage('contribute.pending', { tokenAmount }),
                [PROGRESS_STATUS.SUCCESS]: dictionaryStage('contribute.success', { tokenAmount }),
                [PROGRESS_STATUS.ERROR]: contributeFundsErrorMessage,
              },
              status: contributeFundsStatus,
            },
          ]}
        />
      ) : null}
    </>
  );
}
