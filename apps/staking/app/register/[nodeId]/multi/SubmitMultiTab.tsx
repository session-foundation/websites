import {
  type MultiRegistrationFormSchema,
  useRegistrationWizard,
} from '@/app/register/[nodeId]/Registration';
import { isValidReservedSlots } from '@/app/register/[nodeId]/multi/ReserveSlotsInputTab';
import {
  type ErrorBoxProps,
  ErrorTab,
  recoverableErrors,
} from '@/app/register/[nodeId]/shared/ErrorTab';
import { RegistrationEditButton } from '@/app/register/[nodeId]/shared/RegistrationEditButton';
import { REG_TAB } from '@/app/register/[nodeId]/types';
import { ActionModuleRow } from '@/components/ActionModule';
import useContributeStakeToOpenNode, {
  type UseContributeStakeToOpenNodeParams,
} from '@/hooks/useContributeStakeToOpenNode';
import useCreateOpenNodeRegistration, {
  type UseCreateOpenNodeContractParams,
} from '@/hooks/useCreateOpenNodeRegistration';
import {
  formatDate,
  formatLocalizedRelativeTimeToNowClient,
  formatPercentage,
} from '@/lib/locale-client';
import { externalLink } from '@/lib/locale-defaults';
import { getContributionContractBySnKey } from '@/lib/queries/getContributionContractBySnKey';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { SENT_DECIMALS, SENT_SYMBOL, getContractErrorName } from '@session/contracts';
import { PubKey } from '@session/ui/components/PubKey';
import Typography from '@session/ui/components/Typography';
import { cn } from '@session/ui/lib/utils';
import { PROGRESS_STATUS, Progress } from '@session/ui/motion/progress';
import { Button } from '@session/ui/ui/button';
import { Form, FormErrorMessage } from '@session/ui/ui/form';
import { Tooltip } from '@session/ui/ui/tooltip';
import { stringToBigInt } from '@session/util-crypto/maths';
import { safeTrySync } from '@session/util-js/try';
import { useTranslations } from 'next-intl';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import { useEffect, useMemo, useState } from 'react';
import { isAddress } from 'viem';

export function SubmitMultiTab() {
  const [creationParams, setCreationParams] = useState<UseCreateOpenNodeContractParams | null>(
    null
  );
  const [stakingParams, setStakingParams] = useState<Omit<
    UseContributeStakeToOpenNodeParams,
    'contractAddress'
  > | null>(null);

  const { props, setIsSubmitting, formMulti, address } = useRegistrationWizard();

  const dictionary = useTranslations('actionModules.registration.shared.submit');
  const dictionaryRegistrationShared = useTranslations('actionModules.registration.shared');
  const dictShared = useTranslations('actionModules.shared');
  const dictMulti = useTranslations('actionModules.registration.submitMulti');
  const sessionNodeDictionary = useTranslations('sessionNodes.general');

  const dictionaryStakeAmount = useTranslations('actionModules.stakeAmount.validation');
  const dictionaryOperatorFee = useTranslations('actionModules.operatorFee.validation');

  const onSubmit = (data: MultiRegistrationFormSchema) => {
    try {
      setIsSubmitting(true);

      if (!isAddress(data.rewardsAddress)) {
        formMulti.setError('root', {
          type: 'manual',
          message: 'Rewards Address is not a valid Ethereum Address',
        });
        return;
      }

      if (!isAddress(address)) {
        formMulti.setError('root', {
          type: 'manual',
          message: 'Wallet Address is not a valid Ethereum Address',
        });
        return;
      }

      const [err, operatorFee] = safeTrySync(() =>
        data.operatorFee ? Math.trunc(Number.parseFloat(data.operatorFee.substring(0, 5)) * 100) : 0
      );

      if (err) {
        formMulti.setError('root', {
          type: 'manual',
          message: dictionaryOperatorFee('incorrectFormat'),
        });
        return;
      }

      const [errBigInt, stakeAmount] = safeTrySync(() =>
        stringToBigInt(data.stakeAmount, SENT_DECIMALS)
      );

      if (errBigInt) {
        formMulti.setError('root', {
          type: 'manual',
          message: dictionaryStakeAmount('incorrectFormat'),
        });
        return;
      }

      if (!isValidReservedSlots(data.reservedContributors)) {
        formMulti.setError('root', {
          type: 'manual',
          message: 'Invalid reserved slots',
        });
        return;
      }

      setCreationParams({
        blsPubKey: props.blsKey,
        blsSignature: props.blsSignature,
        nodePubKey: props.ed25519PubKey,
        userSignature: props.ed25519Signature,
        reservedContributors: data.reservedContributors,
        fee: operatorFee,
        autoStart: data.autoActivate,
      });

      setStakingParams({
        stakeAmount,
        userAddress: address,
        beneficiary: data.rewardsAddress,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-3.5">
      <ActionModuleRow
        label={sessionNodeDictionary('publicKeyShort')}
        tooltip={sessionNodeDictionary('publicKeyDescription')}
      >
        <PubKey
          pubKey={props.ed25519PubKey}
          force="collapse"
          alwaysShowCopyButton
          leadingChars={8}
          trailingChars={4}
        />
      </ActionModuleRow>
      <ActionModuleRow
        label={sessionNodeDictionary('blsKey')}
        tooltip={sessionNodeDictionary('blsKeyDescription')}
      >
        <PubKey
          pubKey={props.blsKey}
          force="collapse"
          alwaysShowCopyButton
          leadingChars={8}
          trailingChars={4}
        />
      </ActionModuleRow>
      <ActionModuleRow
        label={dictionary('preparedAt')}
        tooltip={dictionary('preparedAtDescription')}
      >
        <Tooltip
          tooltipContent={formatDate(props.preparedAt, {
            dateStyle: 'full',
            timeStyle: 'full',
          })}
        >
          <div className="cursor-pointer">
            {formatLocalizedRelativeTimeToNowClient(props.preparedAt, { addSuffix: true })}
          </div>
        </Tooltip>
      </ActionModuleRow>
      <ActionModuleRow
        label={dictShared('rewardsAddress')}
        tooltip={dictShared('rewardsAddressDescription')}
      >
        <PubKey
          pubKey={formMulti.watch('rewardsAddress')}
          force="collapse"
          alwaysShowCopyButton
          leadingChars={8}
          trailingChars={4}
          className="font-semibold"
        />
        <RegistrationEditButton
          aria-label={dictionaryRegistrationShared('buttonEditField.aria')}
          data-testid={ButtonDataTestId.Registration_Submit_Multi_Edit_Rewards_Address}
          tab={REG_TAB.REWARDS_ADDRESS_INPUT_MULTI}
        />
      </ActionModuleRow>
      <ActionModuleRow
        label={dictShared('stakeAmount')}
        tooltip={dictShared('stakeAmountDescription')}
      >
        <span className="font-semibold">
          {formMulti.watch('stakeAmount')} {SENT_SYMBOL}
        </span>
        <RegistrationEditButton
          aria-label={dictionaryRegistrationShared('buttonEditField.aria')}
          data-testid={ButtonDataTestId.Registration_Submit_Multi_Edit_Stake_Amount}
          tab={REG_TAB.STAKE_AMOUNT}
        />
      </ActionModuleRow>
      <ActionModuleRow
        label={dictMulti('autoActivate')}
        tooltip={dictMulti('autoActivateDescription')}
      >
        <span className="font-semibold">
          {formMulti.watch('autoActivate') ? 'Enabled' : 'Disabled'}
        </span>
        <RegistrationEditButton
          aria-label={dictionaryRegistrationShared('buttonEditField.aria')}
          data-testid={ButtonDataTestId.Registration_Submit_Multi_Edit_Auto_Activate}
          tab={REG_TAB.AUTO_ACTIVATE}
        />
      </ActionModuleRow>
      <ActionModuleRow
        label={dictMulti('operatorFee')}
        tooltip={dictMulti('operatorFeeDescription')}
      >
        <span className="font-semibold">
          {formatPercentage(Number.parseFloat(formMulti.watch('operatorFee')) / 100)}
        </span>
        <RegistrationEditButton
          aria-label={dictionaryRegistrationShared('buttonEditField.aria')}
          data-testid={ButtonDataTestId.Registration_Submit_Multi_Edit_Operator_Fee}
          tab={REG_TAB.OPERATOR_FEE}
        />
      </ActionModuleRow>
      <ActionModuleRow
        label={dictMulti('reserveSlots')}
        tooltip={dictMulti('reserveSlotsDescription')}
      >
        <span className="font-semibold">None</span>
        <RegistrationEditButton
          aria-label={dictionaryRegistrationShared('buttonEditField.aria')}
          data-testid={ButtonDataTestId.Registration_Submit_Multi_Edit_Reserve_Slots}
          tab={REG_TAB.RESERVE_SLOTS_INPUT}
        />
      </ActionModuleRow>
      <Form {...formMulti}>
        <form
          onSubmit={formMulti.handleSubmit(onSubmit)}
          className={cn(creationParams ? 'hidden' : '')}
        >
          <Button
            type="submit"
            className="w-full"
            data-testid={ButtonDataTestId.Registration_Submit_Multi_Confirm}
            aria-label={dictionaryRegistrationShared('buttonConfirmAndStake.aria')}
          >
            {dictionaryRegistrationShared('buttonConfirmAndStake.text')}
          </Button>
          <FormErrorMessage />
        </form>
      </Form>
      <ErrorBoundary errorComponent={ErrorMulti}>
        {creationParams && stakingParams ? (
          <SubmitMulti creationParams={creationParams} stakingParams={stakingParams} />
        ) : null}
      </ErrorBoundary>
    </div>
  );
}

function SubmitMulti({
  creationParams,
  stakingParams,
}: {
  creationParams: UseCreateOpenNodeContractParams;
  stakingParams: Omit<UseContributeStakeToOpenNodeParams, 'contractAddress'>;
}) {
  const dict = useTranslations('actionModules.registration.submitMulti');
  const { setIsSubmitting, setIsSuccess, changeTab, setIsError } = useRegistrationWizard();

  const {
    createOpenNodeContract,
    resetCreateOpenNodeContract,
    enabled: isCreateNodeEnabled,
    createNodeContractStatus,
    createNodeContractErrorMessage,
    simulateError: contractSimulateError,
    writeError: contractWriteError,
    transactionError: contractTransactionError,
  } = useCreateOpenNodeRegistration(creationParams);

  const isDeployed = createNodeContractStatus === PROGRESS_STATUS.SUCCESS;

  const {
    data,
    isError: isErrorFetchContractDetails,
    error: errorFetchContractDetails,
  } = useStakingBackendQueryWithParams(
    getContributionContractBySnKey,
    {
      nodePubKey: creationParams.nodePubKey,
    },
    {
      enabled: isDeployed,
    }
  );

  const contractAddress = useMemo(() => {
    if (data && 'contract' in data && data.contract && 'address' in data.contract) {
      if (!isAddress(data.contract.address)) {
        throw new Error(`Contract address is not valid ${data.contract.address}`);
      }
      return data.contract.address;
    }
    return null;
  }, [data]);

  const isDeployedAndStakable = !!(
    createNodeContractStatus === PROGRESS_STATUS.SUCCESS && contractAddress
  );

  const stakingParamsMemoized = useMemo(() => {
    return {
      ...stakingParams,
      contractAddress,
    };
  }, [stakingParams, contractAddress]);

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
  } = useContributeStakeToOpenNode(stakingParamsMemoized);

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
      approveSimulateError ??
      contractTransactionError ??
      contractWriteError ??
      contractSimulateError;

    /**
     * If there is a contract error and it isn't explicitly recoverable, it will be thrown as unrecoverable.
     */
    if (contractError) {
      const name = getContractErrorName(contractError);

      if (recoverableErrors.has(name)) {
        return;
      }

      setIsError(true);
      throw contractError;
    }

    if (errorFetchContractDetails) {
      // TODO: handle backend error
    }
  };

  const isError =
    createNodeContractStatus === PROGRESS_STATUS.ERROR ||
    allowanceReadStatus === PROGRESS_STATUS.ERROR ||
    approveWriteStatus === PROGRESS_STATUS.ERROR ||
    isErrorFetchContractDetails;

  const handleRetry = () => {
    setIsSubmitting(true);
    if (isDeployedAndStakable) {
      resetContributeStake();
    } else {
      resetCreateOpenNodeContract();
      createOpenNodeContract();
    }
  };

  /** Execute on mount */
  useEffect(() => {
    if (!isCreateNodeEnabled && !isContributeStakeEnabled) {
      setIsSubmitting(true);
      createOpenNodeContract();
    }
  }, []);

  useEffect(() => {
    if (isDeployedAndStakable) {
      contributeStake();
    }
  }, [isDeployedAndStakable]);

  useEffect(() => {
    if (contributeFundsStatus === PROGRESS_STATUS.SUCCESS) {
      setIsSubmitting(false);
      setIsSuccess(true);
      changeTab(REG_TAB.SUCCESS_MULTI);
    }
  }, [contributeFundsStatus]);

  useEffect(() => {
    if (isError) {
      handleError();
    }
  }, [isError]);

  return (
    <div>
      <Typography variant="h3" className="text-start">
        {dict('progress')}
      </Typography>
      <Progress
        steps={[
          {
            text: {
              [PROGRESS_STATUS.IDLE]: dict('create.idle'),
              [PROGRESS_STATUS.PENDING]: dict('create.pending'),
              [PROGRESS_STATUS.SUCCESS]: dict('create.success'),
              [PROGRESS_STATUS.ERROR]: createNodeContractErrorMessage,
            },
            status: createNodeContractStatus,
          },
          {
            text: {
              [PROGRESS_STATUS.IDLE]: dict('address.idle'),
              [PROGRESS_STATUS.PENDING]: dict('address.pending'),
              [PROGRESS_STATUS.SUCCESS]: dict.rich('address.success', {
                link: externalLink(`/explorer/address/${contractAddress}`),
              }),
              [PROGRESS_STATUS.ERROR]: createNodeContractErrorMessage,
            },
            status: isDeployedAndStakable
              ? PROGRESS_STATUS.SUCCESS
              : isDeployed
                ? PROGRESS_STATUS.PENDING
                : PROGRESS_STATUS.IDLE,
          },
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
      <Button
        className={cn('w-full', !isError && 'hidden')}
        disabled={!isError}
        variant="outline"
        onClick={handleRetry}
        data-testid={ButtonDataTestId.Register_Submit_Multi_Retry}
      >
        {dict('retry')}
      </Button>
    </div>
  );
}

function ErrorMulti({ error }: ErrorBoxProps) {
  const dict = useTranslations('actionModules.registration.errorMulti');
  return <ErrorTab error={error} dict={dict} />;
}
