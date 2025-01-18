import {
  getRegistrationMultiFormSchema,
  type MultiRegistrationFormSchema,
  useRegistrationWizard,
} from '@/app/register/[nodeId]/Registration';
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
import { formatPercentage, useDecimalDelimiter } from '@/lib/locale-client';
import { externalLink } from '@/lib/locale-defaults';
import { getContributionContractBySnKey } from '@/lib/queries/getContributionContractBySnKey';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { getContractErrorName, SENT_DECIMALS, SENT_SYMBOL, TOKEN } from '@session/contracts';
import { PubKey } from '@session/ui/components/PubKey';
import Typography from '@session/ui/components/Typography';
import { cn } from '@session/ui/lib/utils';
import { Progress, PROGRESS_STATUS } from '@session/ui/motion/progress';
import { Button } from '@session/ui/ui/button';
import { Form, FormErrorMessage, useForm } from '@session/ui/ui/form';
import { bigIntMin, bigIntToString, stringToBigInt } from '@session/util-crypto/maths';
import { safeTrySync } from '@session/util-js/try';
import { useTranslations } from 'next-intl';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import { useEffect, useMemo, useState } from 'react';
import { isAddress } from 'viem';
import { useNetworkStatus } from '@/components/StatusBar';
import { ActionModuleFeeAccordionRow } from '@/components/ActionModuleFeeAccordionRow';
import {
  BACKEND,
  HANDRAIL_THRESHOLD_DYNAMIC,
  SESSION_NODE,
  SESSION_NODE_FULL_STAKE_AMOUNT,
  SESSION_NODE_MIN_STAKE_MULTI_OPERATOR,
  SIGNIFICANT_FIGURES,
  URL,
} from '@/lib/constants';
import { useNetworkFeeFormula } from '@/hooks/useNetworkFeeFormula';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { EditButton } from '@session/ui/components/EditButton';
import { areHexesEqual } from '@session/util-crypto/string';
import {
  CONTRIBUTION_CONTRACT_STATUS,
  type ContributorContractInfo,
} from '@session/staking-api-js/client';
import { NodeContributorList } from '@/components/NodeCard';
import {
  formatSENTBigInt,
  formatSENTBigIntNoRounding,
  formatSENTNumber,
} from '@session/contracts/hooks/Token';
import { zodResolver } from '@hookform/resolvers/zod';
import { getContributionRangeFromContributors } from '@/lib/maths';
import { useWalletTokenBalance } from '@session/wallet/components/WalletButton';
import { useContributeFundsFeeEstimate } from '@session/contracts/hooks/ServiceNodeContribution';
import { getNonFinalizedDeployedContributorContractAddress } from '@/app/register/[nodeId]/multi/SubmitMultiTab';

export function SubmitStake({ contract }: { contract: ContributorContractInfo }) {
  const [creationParams, setCreationParams] = useState<UseCreateOpenNodeContractParams | null>(
    null
  );
  const [stakingParams, setStakingParams] = useState<Omit<
    UseContributeStakeToOpenNodeParams,
    'contractAddress'
  > | null>(null);

  const { setIsSubmitting } = useRegistrationWizard();

  const { chainId, address } = useWallet();

  const dictionary = useTranslations('actionModules.registration.shared.submit');
  const dictionaryFee = useTranslations('fee');
  const dictionarySubmit = useTranslations('actionModules.registration.submitMulti');
  const dictionaryRegistrationShared = useTranslations('actionModules.registration.shared');
  const dictShared = useTranslations('actionModules.shared');
  const dictMulti = useTranslations('actionModules.registration.submitMulti');
  const sessionNodeDictionary = useTranslations('sessionNodes.general');
  const actionModuleDictionary = useTranslations('actionModules');

  const dictionaryStakeAmount = useTranslations('actionModules.stakeAmount.validation');
  const dictionaryOperatorFee = useTranslations('actionModules.operatorFee.validation');

  const decimalDelimiter = useDecimalDelimiter();

  const isOperator = areHexesEqual(contract.operator_address, address);
  const contributor = contract.contributors.find((contributor) =>
    areHexesEqual(contributor.address, address)
  );
  const haveOtherContributorsContributed = contract.contributors.length > 1;

  const { value: balanceValue } = useWalletTokenBalance();

  const { minStake, maxStake, totalStaked } = getContributionRangeFromContributors(
    contract.contributors
  );

  const formStakingSchema = getRegistrationMultiFormSchema({
    stakeAmount: {
      isOperator,
      decimalDelimiter,
      minStake: SESSION_NODE_MIN_STAKE_MULTI_OPERATOR,
      maxStake: SESSION_NODE_FULL_STAKE_AMOUNT,
      underMinMessage: dictionaryStakeAmount('underMinMessage', {
        min: formatSENTBigIntNoRounding(
          isOperator ? SESSION_NODE_MIN_STAKE_MULTI_OPERATOR : minStake
        ),
      }),
      underMinOperatorMessage: dictionaryStakeAmount('underMinOperator', {
        min: formatSENTBigIntNoRounding(SESSION_NODE_MIN_STAKE_MULTI_OPERATOR),
      }),
      overMaxMessage: dictionaryStakeAmount('overMax', {
        max: formatSENTBigIntNoRounding(maxStake),
      }),
    },
  });

  const formStaking = useForm<MultiRegistrationFormSchema>({
    resolver: zodResolver(formStakingSchema),
    defaultValues: {
      rewardsAddress: address,
      stakeAmount: bigIntToString(
        bigIntMin(SESSION_NODE_MIN_STAKE_MULTI_OPERATOR, balanceValue ?? 0n),
        SENT_DECIMALS,
        decimalDelimiter
      ),
    },
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  const formSettingsSchema = getRegistrationMultiFormSchema({
    operatorFee: {
      minOperatorFee: SESSION_NODE.MIN_OPERATOR_FEE,
      maxOperatorFee: SESSION_NODE.MAX_OPERATOR_FEE,
      incorrectFormatMessage: dictionaryOperatorFee('incorrectFormat'),
      underMinOperatorFeeMessage: dictionaryOperatorFee('underMin', {
        min: SESSION_NODE.MIN_OPERATOR_FEE,
      }),
      overMaxOperatorFeeMessage: dictionaryOperatorFee('overMax', {
        max: SESSION_NODE.MAX_OPERATOR_FEE,
      }),
    },
  });

  const formSettings = useForm<MultiRegistrationFormSchema>({
    resolver: zodResolver(formSettingsSchema),
    defaultValues: {
      autoActivate: contract.autoActivate ?? true,
      operatorFee: contract.fee.toString() ?? '0',
    },
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  const {
    fee: feeContributeFunds,
    gasPrice: gasPriceContributeFunds,
    gasAmount: gasAmountContributeFunds,
  } = useContributeFundsFeeEstimate({
    amount: minStake,
    beneficiary: address,
  });

  const { feeFormatted: feeFormattedContributeFunds, formula: formulaContributeFunds } =
    useNetworkFeeFormula({
      fee: feeContributeFunds,
      gasAmount: gasAmountContributeFunds,
      gasPrice: gasPriceContributeFunds,
      maximumSignificantDigits: SIGNIFICANT_FIGURES.GAS_FEE_BREAKDOWN,
    });

  const gasPrice = gasPriceContributeFunds;

  const gasHighShowTooltip = !!(
    gasPrice && gasPrice > HANDRAIL_THRESHOLD_DYNAMIC(chainId).GAS_PRICE
  );

  const onSubmitStake = (data: MultiRegistrationFormSchema) => {
    try {
      setIsSubmitting(true);

      if (!isAddress(data.rewardsAddress)) {
        formStaking.setError('root', {
          type: 'manual',
          message: 'Rewards Address is not a valid Ethereum Address',
        });
        return;
      }

      if (!isAddress(address)) {
        formStaking.setError('root', {
          type: 'manual',
          message: 'Wallet Address is not a valid Ethereum Address',
        });
        return;
      }

      const [err, operatorFee] = safeTrySync(() =>
        data.operatorFee ? Math.trunc(Number.parseFloat(data.operatorFee.substring(0, 5)) * 100) : 0
      );

      if (err) {
        formStaking.setError('root', {
          type: 'manual',
          message: dictionaryOperatorFee('incorrectFormat'),
        });
        return;
      }

      const [errBigInt, stakeAmount] = safeTrySync(() =>
        stringToBigInt(data.stakeAmount, SENT_DECIMALS)
      );

      if (errBigInt) {
        formStaking.setError('root', {
          type: 'manual',
          message: dictionaryStakeAmount('incorrectFormat'),
        });
        return;
      }

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
        label={actionModuleDictionary('node.contributors')}
        tooltip={actionModuleDictionary('node.contributorsTooltip')}
      >
        <span className="flex flex-row flex-wrap items-center gap-2 align-middle">
          <NodeContributorList contributors={contract.contributors} forceExpand showEmptySlots />
        </span>
      </ActionModuleRow>
      {contributor ? (
        <ActionModuleRow
          label={sessionNodeStakingDictionary('yourStake')}
          tooltip={sessionNodeStakingDictionary('yourStakeDescription')}
        >
          {formatSENTNumber(contributor.amount)}
        </ActionModuleRow>
      ) : null}
      <ActionModuleRow
        label={sessionNodeStakingDictionary('totalStaked')}
        tooltip={sessionNodeStakingDictionary('totalStakedDescription')}
      >
        {`${formatSENTBigInt(totalStaked, TOKEN.DECIMALS, true)} / ${formatSENTBigInt(SESSION_NODE_FULL_STAKE_AMOUNT)}`}
      </ActionModuleRow>
      <ActionModuleRow
        label={sessionNodeDictionary('publicKeyShort')}
        tooltip={sessionNodeDictionary('publicKeyDescription')}
      >
        <PubKey
          pubKey={contract.service_node_pubkey}
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
          pubKey={contract.pubkey_bls}
          force="collapse"
          alwaysShowCopyButton
          leadingChars={8}
          trailingChars={4}
        />
      </ActionModuleRow>
      <ActionModuleRow
        label={dictMulti('autoActivate')}
        tooltip={dictMulti('autoActivateDescription')}
      >
        <span className="font-semibold">{contract.autoActivate ? 'Enabled' : 'Disabled'}</span>
        <RegistrationEditButton
          aria-label={dictionaryRegistrationShared('buttonEditField.aria')}
          data-testid={ButtonDataTestId.Registration_Submit_Multi_Edit_Auto_Activate}
          tab={REG_TAB.AUTO_ACTIVATE}
        />
      </ActionModuleRow>
      <ActionModuleRow
        label={dictShared('operatorAddress')}
        tooltip={dictShared('operatorAddressDescription')}
      >
        <PubKey
          pubKey={contract.operator_address}
          force="collapse"
          alwaysShowCopyButton
          leadingChars={8}
          trailingChars={4}
          className="font-semibold"
        />
      </ActionModuleRow>
      <ActionModuleRow
        label={dictMulti('operatorFee')}
        tooltip={dictMulti('operatorFeeDescription')}
      >
        <span className="font-semibold">{formatPercentage(contract.fee / 100)}</span>
        {isOperator ? (
          <EditButton
            disabled={haveOtherContributorsContributed}
            aria-label={dictionaryRegistrationShared('buttonEditField.aria')}
            data-testid={ButtonDataTestId.Registration_Submit_Multi_Edit_Operator_Fee}
          />
        ) : null}
      </ActionModuleRow>
      {contributor ? (
        <ActionModuleRow
          label={dictShared('rewardsAddress')}
          tooltip={dictShared('rewardsAddressDescription')}
        >
          <PubKey
            pubKey={contributor.beneficiary ?? address}
            force="collapse"
            alwaysShowCopyButton
            leadingChars={8}
            trailingChars={4}
            className="font-semibold"
          />
          <EditButton
            aria-label={dictionaryRegistrationShared('buttonEditField.aria')}
            data-testid={ButtonDataTestId.Registration_Submit_Multi_Edit_Rewards_Address}
          />
        </ActionModuleRow>
      ) : null}
      {contributor ? (
        <ActionModuleRow
          label={dictShared('stakeAmount')}
          tooltip={dictShared('stakeAmountDescription')}
        >
          <span className="font-semibold">
            {formatSENTNumber(contributor.amount)} {SENT_SYMBOL}
          </span>
          <RegistrationEditButton
            aria-label={dictionaryRegistrationShared('buttonEditField.aria')}
            data-testid={ButtonDataTestId.Registration_Submit_Multi_Edit_Stake_Amount}
            tab={REG_TAB.STAKE_AMOUNT}
          />
        </ActionModuleRow>
      ) : null}
      <ActionModuleFeeAccordionRow
        label={dictionaryFee('networkFee')}
        tooltip={dictionaryFee.rich('networkFeeTooltipWithFormula', {
          link: externalLink(URL.GAS_INFO),
          formula: () => formulaContributeFunds,
        })}
        fees={[
          {
            label: dictionarySubmit('deployCost'),
            fee: feeFormattedContributeFunds,
            tooltip: formulaContributeFunds,
          },
        ]}
        totalFee={feeFormattedContributeFunds}
        hasMissingEstimatesTooltipContent={dictionaryFee('missingFees')}
        gasHighShowTooltip={gasHighShowTooltip}
        gasHighTooltip={dictionaryFee.rich('gasHigh', { link: externalLink(URL.GAS_INFO) })}
      />
      <Form {...formMulti}>
        <form
          onSubmit={formMulti.handleSubmit(onSubmitStake)}
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
  const { setIsSubmitting, setIsSuccess, changeTab, setIsError, setContract, contract, address } =
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

  const deployedTimestampMs = useMemo(() => (isDeployed ? Date.now() : null), [isDeployed]);

  const { networkInfo, refetch: refetchNetworkStatus, setNetworkInfo } = useNetworkStatus();

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
     *  (l2_height_timestamp + {@link BACKEND.L2_TARGET_UPDATE_INTERVAL_SECONDS} + 5s)
     *
     *  This refetch interval computation continues after each fetch until the contract address is
     *  available in the query state. Then the interval is disabled and no more refetches are made.
     */
    {
      enabled: isDeployed || !isCreateNodeEnabled,
      refetchInterval: (query) => {
        if (getNonFinalizedDeployedContributorContractAddress(query.state.data)) return false;

        if (networkInfo?.l2_height_timestamp && deployedTimestampMs) {
          /** {@link BACKEND.L2_TARGET_UPDATE_INTERVAL_SECONDS} after the last l2 update */
          const nextL2UpdateTimestampMs =
            (networkInfo.l2_height_timestamp + BACKEND.L2_TARGET_UPDATE_INTERVAL_SECONDS) * 1000;

          const msUntilNextL2Update = nextL2UpdateTimestampMs - Date.now();

          // Update 5s after the next l2 update (no less than 1s from now)
          return Math.max(msUntilNextL2Update + 5000, 1000);
        }
      },
      gcTime: Number.POSITIVE_INFINITY,
      staleTime: Number.POSITIVE_INFINITY,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  /**
   * Contract address is null if the contract is finalized or if there is no contract yet.
   * In both cases we want to create a new contract.
   */
  const contractAddress = contract?.address ?? null;

  const isContractStakedToByOperator = useMemo(() => {
    if (!contract) return false;
    return contract.contributors.some((contributor) => areHexesEqual(contributor.address, address));
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
    createNodeContractStatus === PROGRESS_STATUS.ERROR ||
    allowanceReadStatus === PROGRESS_STATUS.ERROR ||
    approveWriteStatus === PROGRESS_STATUS.ERROR ||
    isErrorFetchContractDetails;

  const handleRetry = () => {
    setIsSubmitting(true);
    if (contract) {
      resetContributeStake();
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
    if (!isSuccessFetchContractDetails) {
      return;
    }

    if (contract) {
      handleSuccess();
    } else if (
      !isCreateNodeEnabled &&
      !isContributeStakeEnabled &&
      isSuccessFetchContractDetails &&
      !contract
    ) {
      setIsSubmitting(true);
      createOpenNodeContract();
    }
  }, [
    isCreateNodeEnabled,
    isCreateNodeEnabled,
    isSuccessFetchContractDetails,
    contract,
    isCreateNodeEnabled,
  ]);

  useEffect(() => {
    if (data) {
      if ('network' in data && data.network) {
        setNetworkInfo(data.network);
      }
      if ('contract' in data && data.contract) {
        if (data.contract.status === CONTRIBUTION_CONTRACT_STATUS.Finalized) {
          setContract(null);
        } else {
          setContract(data.contract);
        }
      }
    }
  }, [data]);

  useEffect(() => {
    if (contributeFundsStatus === PROGRESS_STATUS.SUCCESS) {
      handleSuccess();
    } else if (isContractStakeable) {
      /**
       * Move to contribute state step if the contract is not staked to by the operator (new contract).
       *
       * If a contract matching the node is already staked to this is a success state. This should only
       * be possible if someone refreshes the page
       */
      if (!isContractStakedToByOperator && !isContributeStakeEnabled) {
        contributeStake();
      } else {
        handleSuccess();
      }
    }
  }, [
    isContractStakeable,
    isContractStakedToByOperator,
    isContributeStakeEnabled,
    contributeFundsStatus,
  ]);

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
            status: isDeployedAndStakeable
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
