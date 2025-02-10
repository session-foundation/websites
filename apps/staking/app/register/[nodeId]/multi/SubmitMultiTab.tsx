import {
  type MultiRegistrationFormSchema,
  useRegistrationWizard,
} from '@/app/register/[nodeId]/Registration';
import { isValidReservedSlots } from '@/app/register/[nodeId]/multi/ReserveSlotsInputTab';
import {
  type ErrorBoxProps,
  ErrorTabRegistration,
  recoverableErrors,
} from '@/app/register/[nodeId]/shared/ErrorTab';
import { RegistrationEditButton } from '@/app/register/[nodeId]/shared/RegistrationEditButton';
import { REG_TAB } from '@/app/register/[nodeId]/types';
import { ActionModuleRow } from '@/components/ActionModule';
import useContributeStakeToOpenNode, {
  type UseContributeStakeToOpenNodeParams,
} from '@/hooks/useContributeStakeToOpenNode';
import useCreateOpenNodeRegistration, {
  type ReservedContributorStruct,
  type UseCreateOpenNodeContractParams,
} from '@/hooks/useCreateOpenNodeRegistration';
import {
  formatDate,
  formatLocalizedRelativeTimeToNowClient,
  formatPercentage,
  useDecimalDelimiter,
} from '@/lib/locale-client';
import { externalLink } from '@/lib/locale-defaults';
import { getContributionContractBySnKey } from '@/lib/queries/getContributionContractBySnKey';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { getContractErrorName, SENT_DECIMALS, SENT_SYMBOL } from '@session/contracts';
import { PubKey } from '@session/ui/components/PubKey';
import Typography from '@session/ui/components/Typography';
import { cn } from '@session/ui/lib/utils';
import { Progress, PROGRESS_STATUS } from '@session/ui/motion/progress';
import { Button } from '@session/ui/ui/button';
import { Form, FormErrorMessage } from '@session/ui/ui/form';
import { AlertTooltip, Tooltip } from '@session/ui/ui/tooltip';
import { stringToBigInt } from '@session/util-crypto/maths';
import { safeTrySync } from '@session/util-js/try';
import { useTranslations } from 'next-intl';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import { useEffect, useMemo, useState } from 'react';
import { isAddress } from 'viem';
import { useNetworkStatus } from '@/components/StatusBar';
import { ActionModuleFeeAccordionRow } from '@/components/ActionModuleFeeAccordionRow';
import { BACKEND, HANDRAIL_THRESHOLD_DYNAMIC, SIGNIFICANT_FIGURES, URL } from '@/lib/constants';
import { useCreateOpenNodeFeeEstimate } from '@session/contracts/hooks/ServiceNodeContributionFactory';
import { useNetworkFeeFormula } from '@/hooks/useNetworkFeeFormula';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { CONTRIBUTION_CONTRACT_STATUS } from '@session/staking-api-js/client';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import { useWalletTokenBalance } from '@session/wallet/components/WalletButton';
import { ReservedStakesTable } from '@/components/ReservedStakesTable';
import { getContributedContributor } from '@/app/stake/[address]/StakeInfo';

export function SubmitMultiTab() {
  const [creationParams, setCreationParams] = useState<UseCreateOpenNodeContractParams | null>(
    null
  );
  const [stakingParams, setStakingParams] = useState<Omit<
    UseContributeStakeToOpenNodeParams,
    'contractAddress'
  > | null>(null);

  const { props, setIsSubmitting, formMulti, address } = useRegistrationWizard();

  const { chainId } = useWallet();
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
  const dictOperatorFee = useTranslations('actionModules.operatorFee.validation');

  const reservedContributors = formMulti.watch('reservedContributors');
  const autoStart = formMulti.watch('autoActivate');
  const operatorFee = formMulti.watch('operatorFee');

  const createOpenNodeEstimateParams = useMemo(() => {
    const [_, fee] = safeTrySync(() =>
      operatorFee ? Math.trunc(Number.parseFloat(operatorFee.substring(0, 5)) * 100) : 0
    );

    return {
      blsPubKey: props.blsKey,
      blsSignature: props.blsSignature,
      nodePubKey: props.ed25519PubKey,
      userSignature: props.ed25519Signature,
      /** Cast to array to avoid TS error -- this is fine, we're estimating the fee */
      reservedContributors: reservedContributors as Array<ReservedContributorStruct>,
      fee: fee ?? 0,
      autoStart,
    };
  }, [props, operatorFee, autoStart, reservedContributors]);

  const {
    fee: feeDeploy,
    gasPrice: gasPriceDeploy,
    gasAmount: gasAmountDeploy,
  } = useCreateOpenNodeFeeEstimate(createOpenNodeEstimateParams);

  const { feeFormatted: feeFormattedDeploy, formula: formulaDeploy } = useNetworkFeeFormula({
    fee: feeDeploy,
    gasAmount: gasAmountDeploy,
    gasPrice: gasPriceDeploy,
    maximumSignificantDigits: SIGNIFICANT_FIGURES.GAS_FEE_BREAKDOWN,
  });

  const gasPrice = gasPriceDeploy;

  const gasHighShowTooltip = !!(
    gasPrice && gasPrice > HANDRAIL_THRESHOLD_DYNAMIC(chainId).GAS_PRICE
  );

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
        userAddress: address,
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
) {
  if (data && 'contracts' in data && Array.isArray(data.contracts) && data.contracts.length) {
    const contract = data.contracts
      .filter((contract) => contract.status !== CONTRIBUTION_CONTRACT_STATUS.Finalized)
      .sort((a, b) => b.created_timestamp - a.created_timestamp)[0];

    if (contract && 'address' in contract && isAddress(contract.address)) {
      return contract;
    }
  }
  return null;
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

  const { setNetworkInfo } = useNetworkStatus();

  const {
    data,
    isError: isErrorFetchContractDetails,
    error: errorFetchContractDetails,
    isSuccess: isSuccessFetchContractDetails,
  } = useStakingBackendQueryWithParams(
    getContributionContractBySnKey,
    {
      nodePubKey: creationParams.nodePubKey,
    },
    /**
     * Starts fetching after the contract is deployed.
     *  Once data is returned by the query {@link networkInfo} is updated with the latest network
     *  info from the fetch, this contains the last l2 height.
     *
     *  After this first fetch the `refetchInterval` computes the next l2 update timestamp and
     *  schedules a refetch 5s after this timestamp.
     *  (l2_height_timestamp + {@link BACKEND.L2_TARGET_UPDATE_INTERVAL_SECONDS} )
     *
     *  This refetch interval computation continues after each fetch until the contract address is
     *  available in the query state. Then the interval is disabled and no more refetches are made.
     */
    {
      enabled: isDeployed || !isCreateNodeEnabled,
      refetchInterval: (query) => {
        if (getNonFinalizedLatestDeployedContributorContract(query.state.data)) return false;

        const l2HeightTimestamp =
          query.state.data &&
          'network' in query.state.data &&
          query.state.data.network &&
          'l2_height_timestamp' in query.state.data.network
            ? query.state.data.network.l2_height_timestamp
            : null;

        // TODO: investigate using trysafe
        // const [_, l2HeightTimestamp] = safeTrySync(() => query.state.data?.network.l2_height_timestamp);

        if (l2HeightTimestamp) {
          /** {@link BACKEND.L2_TARGET_UPDATE_INTERVAL_SECONDS} after the last l2 update */
          const nextL2UpdateTimestampMs =
            (l2HeightTimestamp + BACKEND.L2_TARGET_UPDATE_INTERVAL_SECONDS) * 1000;

          const msUntilNextL2Update = nextL2UpdateTimestampMs - Date.now();

          // Update at the next l2 update (no less than 1s from now)
          return Math.max(msUntilNextL2Update, 1000);
        }
      },
      gcTime: Number.POSITIVE_INFINITY,
      staleTime: Number.POSITIVE_INFINITY,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  const contract = useMemo(() => getNonFinalizedLatestDeployedContributorContract(data), [data]);

  useEffect(() => {
    if (contract) {
      setContract(contract);
    } else {
      setContract(null);
    }
  }, [contract]);

  useEffect(() => {
    if (data && 'network' in data && data.network) {
      setNetworkInfo(data.network);
    }
  }, [data]);

  /**
   * Contract address is null if the contract is finalized or if there is no contract yet.
   * In both cases we want to create a new contract.
   */
  const contractAddress = contract?.address ?? null;

  const isContractStakedToByOperator = useMemo(() => {
    if (!contract) return false;
    return !!getContributedContributor(contract, address);
  }, [contract, address]);

  const isContractStakeable = !!(
    contract && contract.status === CONTRIBUTION_CONTRACT_STATUS.WaitForOperatorContrib
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

  useEffect(() => {
    if (contributeFundsStatus === PROGRESS_STATUS.SUCCESS) {
      handleSuccess();
    }
  }, [contributeFundsStatus]);

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
            status: Math.max(createNodeContractStatus, getAddressStatus, approveWriteStatus),
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
