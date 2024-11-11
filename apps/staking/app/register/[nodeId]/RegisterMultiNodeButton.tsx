import useCreateOpenNodeRegistration, {
  type ReservedContributorStruct,
} from '@/hooks/useCreateOpenNodeRegistration';
import { Progress, PROGRESS_STATUS } from '@session/ui/motion/progress';
import { useTranslations } from 'next-intl';
import { useAccount } from 'wagmi';
import { useRemoteFeatureFlagQuery } from '@/lib/feature-flags-client';
import { REMOTE_FEATURE_FLAG } from '@/lib/feature-flags';
import * as React from 'react';
import { useEffect, useMemo } from 'react';
import useContributeStakeToOpenNode from '@/hooks/useContributeStakeToOpenNode';
import { formatSENTBigIntNoRounding } from '@session/contracts/hooks/SENT';
import { toast } from '@session/ui/lib/toast';
import { RegistrationPausedInfo } from '@/components/RegistrationPausedInfo';
import { Tooltip } from '@session/ui/ui/tooltip';
import { Button } from '@session/ui/ui/button';
import { ButtonDataTestId, LinkDataTestId } from '@/testing/data-test-ids';
import type { ParsedRegistrationData } from '@/app/register/[nodeId]/NodeRegistrationForm';
import { externalLink } from '@/lib/locale-defaults';

type RegisterMultiNodeButtonProps = {
  blsPubKey: string;
  blsSignature: string;
  className: string;
  disabled?: boolean;
  formData: ParsedRegistrationData | null;
  isRegistrationPausedFlagEnabled?: boolean;
  isSolo: boolean;
  multiStatus: PROGRESS_STATUS;
  nodePubKey: string;
  setMultiStatus: (status: PROGRESS_STATUS) => void;
  userSignature: string;
  watchedReservedSlots: Array<Omit<ReservedContributorStruct, 'addr'> & { addr: string }>;
};

export function RegisterMultiNodeButton({
  blsPubKey,
  blsSignature,
  className,
  disabled,
  formData,
  isRegistrationPausedFlagEnabled,
  isSolo,
  multiStatus,
  nodePubKey,
  setMultiStatus,
  userSignature,
  watchedReservedSlots,
}: RegisterMultiNodeButtonProps) {
  const dictionary = useTranslations('actionModules.register');
  const dictionaryStage = useTranslations('actionModules.register.stageMulti');
  const { address } = useAccount();

  const { enabled: isMultiRegDisabled } = useRemoteFeatureFlagQuery(
    REMOTE_FEATURE_FLAG.DISABLE_NODE_REGISTRATION_MULTI
  );

  const registerNodeArgs = useMemo(
    () => ({
      blsPubKey,
      blsSignature,
      nodePubKey,
      reservedContributors: formData?.reservedContributors ?? [],
      userSignature,
      fee: formData?.operatorFee ?? 0,
      autoStart: formData?.autoRegister ?? true,
    }),
    [blsPubKey, blsSignature, nodePubKey, userSignature, formData]
  );

  const {
    createOpenNodeContract,
    resetCreateOpenNodeContract,
    enabled: isCreateNodeEnabled,
    createNodeContractStatus,
    createNodeContractErrorMessage,
    openNodeContractAddress,
  } = useCreateOpenNodeRegistration(registerNodeArgs);

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

  const tokenAmount = formatSENTBigIntNoRounding(formData?.stakeAmount);

  useEffect(() => {
    if (!isSolo && formData) {
      if (isRegistrationPausedFlagEnabled) {
        toast.error(<RegistrationPausedInfo />);
      } else {
        setMultiStatus(PROGRESS_STATUS.PENDING);
        if (isContributeStakeEnabled) {
          resetContributeStake();
          contributeStake();
        } else if (isCreateNodeEnabled) {
          resetCreateOpenNodeContract();
          createOpenNodeContract();
        } else {
          createOpenNodeContract();
        }
      }
    }
  }, [
    isSolo,
    formData,
    isRegistrationPausedFlagEnabled,
    isContributeStakeEnabled,
    isCreateNodeEnabled,
  ]);

  useEffect(() => {
    if (
      isCreateNodeEnabled &&
      !isContributeStakeEnabled &&
      createNodeContractStatus === PROGRESS_STATUS.SUCCESS &&
      openNodeContractAddress
    ) {
      contributeStake();
    }
  }, [
    isCreateNodeEnabled,
    isContributeStakeEnabled,
    createNodeContractStatus,
    openNodeContractAddress,
  ]);

  useEffect(() => {
    if (
      [
        createNodeContractStatus,
        allowanceReadStatus,
        approveWriteStatus,
        contributeFundsStatus,
      ].some((status) => status === PROGRESS_STATUS.ERROR)
    ) {
      setMultiStatus(PROGRESS_STATUS.ERROR);
    }
  }, [createNodeContractStatus, allowanceReadStatus, approveWriteStatus, contributeFundsStatus]);

  return (
    <>
      {watchedReservedSlots.length ? (
        isSolo ? (
          <Tooltip
            tooltipContent={dictionary('button.submitMultiRegisterDisabledIsSoloDescription')}
          >
            <div className={className}>
              <Button
                data-testid={ButtonDataTestId.Register_Submit_Multi_Register_Only}
                rounded="lg"
                size="lg"
                variant="outline"
                type="submit"
                disabled
                className="w-full"
              >
                {dictionary('button.submitMultiRegisterOnly')}
              </Button>
            </div>
          </Tooltip>
        ) : !isMultiRegDisabled ? (
          <Button
            className={className}
            data-testid={ButtonDataTestId.Register_Submit_Multi_Register_Only}
            rounded="lg"
            size="lg"
            variant="outline"
            type="submit"
            disabled={
              disabled ||
              isMultiRegDisabled ||
              (multiStatus !== PROGRESS_STATUS.IDLE && multiStatus !== PROGRESS_STATUS.ERROR)
            }
          >
            {dictionary('button.submitMultiRegisterOnly')}
          </Button>
        ) : (
          <Tooltip tooltipContent={dictionary('button.submitMultiRegisterDisabledDescription')}>
            <div className={className}>
              <Button
                data-testid={ButtonDataTestId.Register_Submit_Multi_Register_Only}
                rounded="lg"
                size="lg"
                variant="outline"
                type="submit"
                disabled
                className="w-full"
              >
                {dictionary('button.submitMultiRegisterOnly')}
              </Button>
            </div>
          </Tooltip>
        )
      ) : null}
      {isSolo ? (
        <Tooltip tooltipContent={dictionary('button.submitMultiRegisterDisabledIsSoloDescription')}>
          <div className={className}>
            <Button
              data-testid={ButtonDataTestId.Register_Submit_Multi}
              rounded="lg"
              size="lg"
              type="submit"
              disabled
              className="w-full"
            >
              {dictionary('button.submitMultiRegisterAndStake')}
            </Button>
          </div>
        </Tooltip>
      ) : !isMultiRegDisabled ? (
        <Button
          className={className}
          data-testid={ButtonDataTestId.Register_Submit_Multi}
          rounded="lg"
          size="lg"
          type="submit"
          disabled={
            disabled || createNodeContractStatus !== PROGRESS_STATUS.IDLE || isMultiRegDisabled
          }
        >
          {dictionary('button.submitMultiRegisterAndStake')}
        </Button>
      ) : (
        <Tooltip tooltipContent={dictionary('button.submitMultiRegisterDisabledDescription')}>
          <div className={className}>
            <Button
              data-testid={ButtonDataTestId.Register_Submit_Multi}
              rounded="lg"
              size="lg"
              type="submit"
              disabled
              className="w-full"
            >
              {dictionary('button.submitMultiRegisterAndStake')}
            </Button>
          </div>
        </Tooltip>
      )}
      {!isSolo && isCreateNodeEnabled ? (
        <Progress
          steps={[
            {
              text: {
                [PROGRESS_STATUS.IDLE]: dictionaryStage('create.idle'),
                [PROGRESS_STATUS.PENDING]: dictionaryStage('create.pending'),
                [PROGRESS_STATUS.SUCCESS]: dictionaryStage('create.success'),
                [PROGRESS_STATUS.ERROR]: createNodeContractErrorMessage,
              },
              status: createNodeContractStatus,
            },
            {
              text: {
                [PROGRESS_STATUS.IDLE]: dictionaryStage('address.idle'),
                [PROGRESS_STATUS.PENDING]: dictionaryStage('address.pending'),
                [PROGRESS_STATUS.SUCCESS]: dictionaryStage.rich('address.success', {
                  link: externalLink({
                    href: `/explorer/address/${openNodeContractAddress}`,
                    dataTestId: LinkDataTestId.Multi_Node_Explorer_Address,
                  }),
                }),
                [PROGRESS_STATUS.ERROR]: createNodeContractErrorMessage,
              },
              status:
                openNodeContractAddress !== null
                  ? PROGRESS_STATUS.SUCCESS
                  : createNodeContractStatus === PROGRESS_STATUS.SUCCESS
                    ? PROGRESS_STATUS.PENDING
                    : PROGRESS_STATUS.IDLE,
            },
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
              status: openNodeContractAddress === null ? PROGRESS_STATUS.IDLE : allowanceReadStatus,
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
