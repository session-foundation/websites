import {
  type MultiRegistrationFormSchema,
  useRegistrationWizard,
} from '@/app/register/[nodeId]/Registration';
import { isValidReservedSlots } from '@/app/register/[nodeId]/multi/ReserveSlotsInputTab';
import { ErrorTabRegistration, recoverableErrors } from '@/app/register/[nodeId]/shared/ErrorTab';
import { RegistrationEditButton } from '@/app/register/[nodeId]/shared/RegistrationEditButton';
import { REG_TAB } from '@/app/register/[nodeId]/types';
import { getContributedContributor } from '@/app/stake/[address]/StakeInfo';
import { ActionModuleRow } from '@/components/ActionModule';
import { ActionModuleFeeAccordionRow } from '@/components/ActionModuleFeeAccordionRow';
import type { ErrorBoxProps } from '@/components/Error/ErrorBox';
import { ReservedStakesTable } from '@/components/ReservedStakesTable';
import { useNetworkStatus } from '@/components/StatusBar';
import useContributeStakeToOpenNode, {
  type UseContributeStakeToOpenNodeParams,
} from '@/hooks/useContributeStakeToOpenNode';
import useCreateOpenNodeRegistration, {
  type UseCreateOpenNodeContractParams,
} from '@/hooks/useCreateOpenNodeRegistration';
import { useNetworkFeeFormula } from '@/hooks/useNetworkFeeFormula';
import { BACKEND, HANDRAIL_THRESHOLDS, SIGNIFICANT_FIGURES, URL } from '@/lib/constants';
import { REMOTE_FEATURE_FLAG } from '@/lib/feature-flags';
import { useRemoteFeatureFlagQuery } from '@/lib/feature-flags-client';
import {
  formatLocalizedRelativeTimeToNowClient,
  formatPercentage,
  useDecimalDelimiter,
  useFormatDate,
} from '@/lib/locale-client';
import { externalLink } from '@/lib/locale-defaults';
import { getContributionContractBySnKey } from '@/lib/queries/getContributionContractBySnKey';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { SENT_DECIMALS, SENT_SYMBOL, getContractErrorName } from '@session/contracts';
import { useCreateOpenNodeFeeEstimate } from '@session/contracts/hooks/ServiceNodeContributionFactory';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import { CONTRIBUTION_CONTRACT_STATUS } from '@session/staking-api-js/enums';
import {
  type ContributionContract,
  contributionContractSchema,
} from '@session/staking-api-js/schema';
import { PubKey } from '@session/ui/components/PubKey';
import Typography from '@session/ui/components/Typography';
import { cn } from '@session/ui/lib/utils';
import { PROGRESS_STATUS, Progress } from '@session/ui/motion/progress';
import { Button } from '@session/ui/ui/button';
import { Form, FormErrorMessage } from '@session/ui/ui/form';
import { AlertTooltip, Tooltip } from '@session/ui/ui/tooltip';
import { stringToBigInt } from '@session/util-crypto/maths';
import { safeTrySync, safeTrySyncWithFallback } from '@session/util-js/try';
import { useWalletTokenBalance } from '@session/wallet/components/WalletButton';
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

  const { enabled: isReservedSlotsDisabled } = useRemoteFeatureFlagQuery(
    REMOTE_FEATURE_FLAG.DISABLE_NODE_REGISTRATION_RESERVED
  );

  const { balance, value: balanceValue } = useWalletTokenBalance();

  const decimalDelimiter = useDecimalDelimiter();

  const dict = useTranslations('actionModules.registration.shared.submit');
  const dictFee = useTranslations('fee');
  const dictSubmit = useTranslations('actionModules.registration.submitMulti');
  const dictGeneral = useTranslations('general');
  const dictRegistrationShared = useTranslations('actionModules.registration.shared');
  const dictShared = useTranslations('actionModules.shared');
  const dictSessionNode = useTranslations('sessionNodes.general');
  const dictStakeAmount = useTranslations('actionModules.stakeAmount.validation');
  const dictReservedSlots = useTranslations('actionModules.registration.reserveSlotsInput');
  const dictReservedSlotsTab = useTranslations('actionModules.registration.reserveSlots');
  const dictOperatorFee = useTranslations('actionModules.operatorFee.validation');

  const reservedContributors = formMulti.watch('reservedContributors');
  const autoStart = formMulti.watch('autoActivate');
  const operatorFee = formMulti.watch('operatorFee');

  const createOpenNodeEstimateParams = useMemo(() => {
    const [_, fee] = safeTrySyncWithFallback(
      () => (operatorFee ? Math.trunc(Number.parseFloat(operatorFee.substring(0, 5)) * 100) : 0),
      0
    );

    return {
      blsPubKey: props.blsKey,
      blsSignature: props.blsSignature,
      nodePubKey: props.ed25519PubKey,
      userSignature: props.ed25519Signature,
      reservedContributors,
      fee,
      autoStart,
    };
  }, [props, operatorFee, autoStart, reservedContributors]);

  const formattedPreparedAtDate = useFormatDate(props.preparedAt, {
    dateStyle: 'full',
    timeStyle: 'full',
  });

  const {
    fee: feeDeploy,
    gasPrice,
    gasAmount: gasAmountDeploy,
  } = useCreateOpenNodeFeeEstimate(createOpenNodeEstimateParams);

  const { feeFormatted: feeFormattedDeploy, formula: formulaDeploy } = useNetworkFeeFormula({
    fee: feeDeploy,
    gasAmount: gasAmountDeploy,
    gasPrice,
    maximumSignificantDigits: SIGNIFICANT_FIGURES.GAS_FEE_BREAKDOWN,
  });

  const gasHighShowTooltip = !!(gasPrice && gasPrice > HANDRAIL_THRESHOLDS.GAS_PRICE);

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
          message: dictOperatorFee('incorrectFormat'),
        });
        return;
      }

      const [errBigInt, stakeAmount] = safeTrySync(() =>
        stringToBigInt(data.stakeAmount, SENT_DECIMALS)
      );

      if (errBigInt) {
        formMulti.setError('root', {
          type: 'manual',
          message: dictStakeAmount('incorrectFormat'),
        });
        return;
      }

      if (!isValidReservedSlots(data.reservedContributors)) {
        formMulti.setError('root', {
          type: 'manual',
          message: dictReservedSlots('validation.invalidReservedSlots'),
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
        beneficiary: data.rewardsAddress,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedStakeAmount = formMulti.watch('stakeAmount');
  const hasReservedSlots = formMulti.watch('reservedContributors').length > 1;

  return (
    <div className="flex w-full flex-col gap-3.5">
      <ActionModuleRow
        label={dictSessionNode('publicKeyShort')}
        tooltip={dictSessionNode('publicKeyDescription')}
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
        label={dictSessionNode('blsKey')}
        tooltip={dictSessionNode('blsKeyDescription')}
      >
        <PubKey
          pubKey={props.blsKey}
          force="collapse"
          alwaysShowCopyButton
          leadingChars={8}
          trailingChars={4}
        />
      </ActionModuleRow>
      <ActionModuleRow label={dict('preparedAt')} tooltip={dict('preparedAtDescription')}>
        <Tooltip tooltipContent={formattedPreparedAtDate}>
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
          aria-label={dictRegistrationShared('buttonEditField.aria')}
          data-testid={ButtonDataTestId.Registration_Submit_Multi_Edit_Rewards_Address}
          tab={REG_TAB.REWARDS_ADDRESS_INPUT_MULTI}
        />
      </ActionModuleRow>
      <ActionModuleRow
        label={dictShared('stakeAmount')}
        tooltip={dictShared('stakeAmountDescription')}
      >
        <span className="inline-flex items-center gap-1.5">
          {balanceValue !== undefined &&
          balanceValue < stringToBigInt(watchedStakeAmount, SENT_DECIMALS) ? (
            <AlertTooltip
              tooltipContent={dictShared('notEnoughTokensAlert', {
                walletAmount: balance,
                tokenAmount: formatSENTBigInt(stringToBigInt(watchedStakeAmount, SENT_DECIMALS), 0),
              })}
            />
          ) : null}
          <span className="font-semibold">
            {watchedStakeAmount} {SENT_SYMBOL}
          </span>
        </span>
        <RegistrationEditButton
          aria-label={dictRegistrationShared('buttonEditField.aria')}
          data-testid={ButtonDataTestId.Registration_Submit_Multi_Edit_Stake_Amount}
          tab={REG_TAB.STAKE_AMOUNT}
          disabled={formMulti.watch('reservedContributors').length > 1}
        />
      </ActionModuleRow>
      <ActionModuleRow
        label={dictShared('autoActivate')}
        tooltip={dictShared('autoActivateDescription')}
      >
        <span className="font-semibold">
          {dictShared(formMulti.watch('autoActivate') ? 'enabled' : 'disabled')}
        </span>
        <RegistrationEditButton
          aria-label={dictRegistrationShared('buttonEditField.aria')}
          data-testid={ButtonDataTestId.Registration_Submit_Multi_Edit_Auto_Activate}
          tab={REG_TAB.AUTO_ACTIVATE}
        />
      </ActionModuleRow>
      <ActionModuleRow
        label={dictShared('operatorFee')}
        tooltip={dictShared('operatorFeeDescription')}
      >
        <span className="font-semibold">
          {formatPercentage(Number.parseFloat(formMulti.watch('operatorFee')) / 100)}
        </span>
        <RegistrationEditButton
          aria-label={dictRegistrationShared('buttonEditField.aria')}
          data-testid={ButtonDataTestId.Registration_Submit_Multi_Edit_Operator_Fee}
          tab={REG_TAB.OPERATOR_FEE}
        />
      </ActionModuleRow>
      <ActionModuleRow
        label={dictShared('reserveSlots')}
        tooltip={dictShared('reserveSlotsDescription')}
        parentClassName={
          hasReservedSlots ? 'flex flex-col gap-2 justify-start items-start w-full' : ''
        }
        containerClassName={hasReservedSlots ? 'w-full' : ''}
      >
        {/* reservedContributors length 1 means only the operator, so we treat it as no reserved slots*/}
        {hasReservedSlots ? (
          <div className="flex w-full flex-col gap-2">
            <ReservedStakesTable
              reservedStakes={formMulti.watch('reservedContributors')}
              className="my-2 w-full"
              actionButton={
                <RegistrationEditButton
                  variant="default"
                  rounded="full"
                  size="icon"
                  className="group"
                  iconClassName="stroke-session-black group-hover:stroke-session-green"
                  aria-label={dictRegistrationShared('buttonEditField.aria')}
                  data-testid={ButtonDataTestId.Registration_Submit_Multi_Edit_Reserve_Slots}
                  tab={REG_TAB.RESERVE_SLOTS_INPUT}
                />
              }
            />
          </div>
        ) : (
          <>
            <span className="font-semibold">{dictGeneral('none')}</span>
            <RegistrationEditButton
              aria-label={dictRegistrationShared('buttonEditField.aria')}
              data-testid={ButtonDataTestId.Registration_Submit_Multi_Edit_Reserve_Slots}
              tab={REG_TAB.RESERVE_SLOTS_INPUT}
              disabled={isReservedSlotsDisabled}
              disabledReason={dictReservedSlotsTab('buttonReserve.disabledTooltip')}
              onClick={() => {
                formMulti.setValue('reservedContributors', [
                  {
                    addr: address,
                    amount: stringToBigInt(watchedStakeAmount, SENT_DECIMALS, decimalDelimiter),
                  },
                ]);
              }}
            />
          </>
        )}
      </ActionModuleRow>
      <ActionModuleFeeAccordionRow
        label={dictFee('networkFee')}
        tooltip={dictFee.rich('networkFeeTooltipWithFormula', {
          link: externalLink(URL.GAS_INFO),
          formula: () => formulaDeploy,
        })}
        fees={[
          {
            label: dictSubmit('deployCost'),
            fee: feeFormattedDeploy,
            tooltip: formulaDeploy,
          },
          /** TODO: implement proxy approval fee estimate once available from backend */
          {
            label: dictSubmit('proxyApprovalCost'),
            fee: null,
            tooltip: 'Unable to estimate network fee.',
          },
          /** TODO: implement contribute funds fee estimate once available from backend */
          {
            label: dictSubmit('contributeFundsCost'),
            fee: null,
            tooltip: 'Unable to estimate network fee.',
          },
        ]}
        totalFee={feeFormattedDeploy}
        hasMissingEstimatesTooltipContent={dictFee('missingFees')}
        gasHighShowTooltip={gasHighShowTooltip}
        gasHighTooltip={dictFee.rich('gasHigh', { link: externalLink(URL.GAS_INFO) })}
      />
      <Form {...formMulti}>
        <form
          onSubmit={formMulti.handleSubmit(onSubmit)}
          className={cn(creationParams ? 'hidden' : '')}
        >
          <Button
            type="submit"
            className="w-full"
            data-testid={ButtonDataTestId.Registration_Submit_Multi_Confirm}
            aria-label={dictRegistrationShared('buttonConfirmAndStake.aria')}
          >
            {dictRegistrationShared('buttonConfirmAndStake.text')}
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

export function getNonFinalizedLatestDeployedContributorContract(
  data?: Awaited<ReturnType<typeof getContributionContractBySnKey>>['data']
): ContributionContract | null {
  const [err, contract] = safeTrySync(() => data?.contract);
  if (err || !contract) return null;

  if (contract.status === CONTRIBUTION_CONTRACT_STATUS.Finalized) return null;

  return contributionContractSchema.safeParse(contract).success
    ? (contract as ContributionContract)
    : null;
}

/**
 * NOTE: `node_add_timestamp` being non-null means the the related node is currently in the network.
 *
 * (A) Check if a contract already exists for the node.
 *   - if found, move to (B).
 *   - if not found, move to (C).
 *
 * (B) Resolve contract details.
 *   - if finalized move to (C). (Contract is for a previous instance of this node)
 *       TODO: in the future investigate contract reuse at this stage and use this logic:
 *          - if `node_add_timestamp` is not null, move to (E).
 *             (It is currently in the network, this state should not be possible)
 *          - if `node_add_timestamp` is null, reset contract and move to (D).
 *             (Reuse this contract, reset it).
 *   - if operator contributed, move to (E).
 *   - if operator not contributed, move to (D).
 *
 * (C) Create contract.
 *   - Create contract wallet interaction.
 *   - Poll for created contract until found.
 *     - Go to (B).
 *
 * (D) Contribute to contract.
 *    - Go to (E).
 *
 * (E) Success.
 *    - Show success page.
 */
function SubmitMulti({
  creationParams,
  stakingParams,
}: {
  creationParams: UseCreateOpenNodeContractParams;
  stakingParams: Omit<UseContributeStakeToOpenNodeParams, 'contractAddress'>;
}) {
  const dict = useTranslations('actionModules.registration.submitMulti');
  const dictShared = useTranslations('actionModules.shared');
  const { setIsSubmitting, setIsSuccess, changeTab, setIsError, setContract, address } =
    useRegistrationWizard();

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
    isSuccess: isSuccessFetchContractDetails,
    isFetching: isFetchingFetchContractDetails,
    isLoading: isLoadingFetchContractDetails,
  } = useStakingBackendQueryWithParams(
    getContributionContractBySnKey,
    {
      nodePubKey: creationParams.nodePubKey,
    },
    {
      gcTime: Number.POSITIVE_INFINITY,
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  const {
    data: dataAfterDeploy,
    isError: isErrorFetchContractDetailsAfterDeploy,
    isFetching: isFetchingFetchContractDetailsAfterDeploy,
    isLoading: isLoadingFetchContractDetailsAfterDeploy,
  } = useStakingBackendQueryWithParams(
    getContributionContractBySnKey,
    {
      nodePubKey: creationParams.nodePubKey,
    },
    {
      enabled: isDeployed || !isCreateNodeEnabled,
      /** Starts fetching after the contract is deployed. Refetches until a non-finalized contract is found. */
      refetchInterval: (query) => {
        if (getNonFinalizedLatestDeployedContributorContract(query.state.data)) return false;
        return BACKEND.MULTI_REGISTRATION_SN_POLL_INTERVAL_MS;
      },
      gcTime: Number.POSITIVE_INFINITY,
      staleTime: Number.POSITIVE_INFINITY,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  useNetworkStatus({
    network: dataAfterDeploy?.network || data?.network,
    isLoading: isLoadingFetchContractDetailsAfterDeploy || isLoadingFetchContractDetails,
    isFetching: isFetchingFetchContractDetailsAfterDeploy || isFetchingFetchContractDetails,
  });

  const contract = useMemo(() => getNonFinalizedLatestDeployedContributorContract(data), [data]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Don't include setters
  useEffect(() => {
    if (contract) {
      setContract(contract);
    } else {
      setContract(null);
    }
  }, [contract]);

  /**
   * Contract address is null if the contract is finalized or if there is no contract yet.
   * In both cases we want to create a new contract.
   */
  const contractAddress = contract?.address || null;

  const isContractStakedToByOperator = useMemo(() => {
    if (!contract) return false;
    return !!getContributedContributor(contract, address);
  }, [contract, address]);

  const isContractStakeable = !!(
    contract && contract.status === CONTRIBUTION_CONTRACT_STATUS.WaitForOperatorContrib
  );

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
  } = useContributeStakeToOpenNode({
    ...stakingParams,
    contractAddress,
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
     * If there is a contract error, and it isn't explicitly recoverable, it will be thrown as unrecoverable.
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
    contributeFundsStatus === PROGRESS_STATUS.ERROR ||
    createNodeContractStatus === PROGRESS_STATUS.ERROR ||
    allowanceReadStatus === PROGRESS_STATUS.ERROR ||
    approveWriteStatus === PROGRESS_STATUS.ERROR ||
    isErrorFetchContractDetailsAfterDeploy ||
    isErrorFetchContractDetails;

  const handleRetry = () => {
    setIsSubmitting(true);
    if (contract) {
      resetContributeStake();
      contributeStake();
    } else {
      resetCreateOpenNodeContract();
      createOpenNodeContract();
    }
  };

  const handleSuccess = () => {
    setIsSubmitting(false);
    setIsSuccess(true);
    changeTab(REG_TAB.SUCCESS_MULTI);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Don't include setters
  useEffect(() => {
    /**
     * Don't do anything until the initial contract details are fetched (to see if one exists already)
     */
    if (!isSuccessFetchContractDetails) {
      return;
    }

    if (contract) {
      /** Already staked to contract, probably refreshed the page */
      if (isContractStakedToByOperator) {
        handleSuccess();
        return;
      }
      /** Contract created in previous step or refreshed page some time after creation */
      if (isContractStakeable && !isContributeStakeEnabled) {
        setIsSubmitting(true);
        contributeStake();
      }
      /** First step if no contract exists */
    } else if (!isCreateNodeEnabled && !isContributeStakeEnabled) {
      setIsSubmitting(true);
      createOpenNodeContract();
    }
  }, [
    isSuccessFetchContractDetails,
    contract,
    isContractStakeable,
    isContractStakedToByOperator,
    isContributeStakeEnabled,
    isCreateNodeEnabled,
  ]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: On success
  useEffect(() => {
    if (contributeFundsStatus === PROGRESS_STATUS.SUCCESS) {
      handleSuccess();
    }
  }, [contributeFundsStatus]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: On error
  useEffect(() => {
    if (isError) {
      handleError();
    }
  }, [isError]);

  const getAddressStatus = contractAddress
    ? PROGRESS_STATUS.SUCCESS
    : isDeployed
      ? PROGRESS_STATUS.PENDING
      : PROGRESS_STATUS.IDLE;

  return (
    <div>
      <Typography variant="h3" className="text-start">
        {dictShared('progress')}
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
            status:
              createNodeContractStatus === PROGRESS_STATUS.ERROR
                ? PROGRESS_STATUS.ERROR
                : Math.max(createNodeContractStatus, getAddressStatus, approveWriteStatus),
          },
          {
            text: {
              [PROGRESS_STATUS.IDLE]: dict('address.idle'),
              [PROGRESS_STATUS.PENDING]: dict('address.pending'),
              [PROGRESS_STATUS.SUCCESS]: dict.rich('address.success', {
                link: externalLink(`/explorer/arbitrum/address/${contractAddress}`),
              }),
              [PROGRESS_STATUS.ERROR]: createNodeContractErrorMessage,
            },
            status: Math.max(getAddressStatus, approveWriteStatus),
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
        {dictShared('retry')}
      </Button>
    </div>
  );
}

function ErrorMulti({ error }: ErrorBoxProps) {
  const dict = useTranslations('actionModules.registration.errorMulti');
  return <ErrorTabRegistration error={error} dict={dict} />;
}
