import {
  type SoloRegistrationFormSchema,
  useRegistrationWizard,
} from '@/app/register/[nodeId]/Registration';
import {
  type ErrorBoxProps,
  ErrorTabRegistration,
  recoverableErrors,
} from '@/app/register/[nodeId]/shared/ErrorTab';
import { RegistrationEditButton } from '@/app/register/[nodeId]/shared/RegistrationEditButton';
import { REG_TAB } from '@/app/register/[nodeId]/types';
import { ActionModuleRow } from '@/components/ActionModule';
import useRegisterNode, { type UseRegisterNodeParams } from '@/hooks/useRegisterNode';
import useRelativeTime from '@/hooks/useRelativeTime';
import {
  HANDRAIL_THRESHOLD_DYNAMIC,
  SESSION_NODE,
  SESSION_NODE_FULL_STAKE_AMOUNT,
  SIGNIFICANT_FIGURES,
  URL,
} from '@/lib/constants';
import { formatDate, formatLocalizedRelativeTimeToNowClient } from '@/lib/locale-client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { addresses, getContractErrorName, isValidChainId } from '@session/contracts';
import {
  formatSENTBigInt,
  useAllowanceQuery,
  useProxyApprovalFeeEstimate,
} from '@session/contracts/hooks/Token';
import {
  type RegisterNodeContributor,
  useAddBlsPubKeyFeeEstimate,
} from '@session/contracts/hooks/ServiceNodeRewards';
import { PubKey } from '@session/ui/components/PubKey';
import Typography from '@session/ui/components/Typography';
import { cn } from '@session/ui/lib/utils';
import { Progress, PROGRESS_STATUS } from '@session/ui/motion/progress';
import { Button } from '@session/ui/ui/button';
import { Form, FormErrorMessage } from '@session/ui/ui/form';
import { AlertTooltip, Tooltip } from '@session/ui/ui/tooltip';
import { useTranslations } from 'next-intl';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import { useEffect, useMemo, useState } from 'react';
import { isAddress } from 'viem';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useNetworkFeeFormula } from '@/hooks/useNetworkFeeFormula';
import { ActionModuleFeeAccordionRow } from '@/components/ActionModuleFeeAccordionRow';
import { externalLink } from '@/lib/locale-defaults';
import { useWalletTokenBalance } from '@session/wallet/components/WalletButton';

export function SubmitSoloTab() {
  const [params, setParams] = useState<UseRegisterNodeParams | null>(null);

  const { props, setIsSubmitting, formSolo, address } = useRegistrationWizard();
  const { chainId } = useWallet();
  const { balance, value: balanceValue } = useWalletTokenBalance();

  const dictionary = useTranslations('actionModules.registration.shared.submit');
  const dictionarySubmit = useTranslations('actionModules.registration.submitSolo');
  const dictionaryFee = useTranslations('fee');
  const dictionaryRegistrationShared = useTranslations('actionModules.registration.shared');
  const dictShared = useTranslations('actionModules.shared');
  const sessionNodeDictionary = useTranslations('sessionNodes.general');

  const contractAddress = useMemo(
    () => (isValidChainId(chainId) ? addresses.ServiceNodeRewards[chainId] : null),
    [chainId]
  );
  const { allowance } = useAllowanceQuery({
    contractAddress,
    gcTime: Number.POSITIVE_INFINITY,
  });

  const rewardsAddress = formSolo.watch('rewardsAddress');

  const needsApproval = allowance === null || allowance < SESSION_NODE_FULL_STAKE_AMOUNT;

  const {
    fee: feeProxyApproval,
    gasAmount: gasAmountProxyApproval,
    gasPrice: gasPriceProxyApproval,
    status: statusProxyApproval,
  } = useProxyApprovalFeeEstimate({ contractAddress, amount: SESSION_NODE_FULL_STAKE_AMOUNT });

  const addBlsFeeParams = useMemo(() => {
    return {
      contributors: [
        {
          staker: { addr: address, beneficiary: rewardsAddress },
          stakedAmount: SESSION_NODE_FULL_STAKE_AMOUNT,
        },
      ],
      blsPubKey: props.blsKey,
      blsSignature: props.blsSignature,
      nodePubKey: props.ed25519PubKey,
      userSignature: props.ed25519Signature,
    };
  }, [props, rewardsAddress, address]);

  const {
    fee: feeAddBlsPubKey,
    gasAmount: gasAmountAddBlsPubKey,
    gasPrice: gasPriceAddBlsPubKey,
    status: statusAddBlsPubKey,
    error: errorAddBlsPubKey,
  } = useAddBlsPubKeyFeeEstimate(addBlsFeeParams);

  const { feeFormatted: feeFormattedProxyApproval, formula: formulaProxyApproval } =
    useNetworkFeeFormula({
      fee: feeProxyApproval,
      gasAmount: gasAmountProxyApproval,
      gasPrice: gasPriceProxyApproval,
      maximumSignificantDigits: SIGNIFICANT_FIGURES.GAS_FEE_BREAKDOWN,
    });

  const { feeFormatted: feeFormattedAddBlsPubKey, formula: formulaAddBlsPubKey } =
    useNetworkFeeFormula({
      fee: feeAddBlsPubKey,
      gasAmount: gasAmountAddBlsPubKey,
      gasPrice: gasPriceAddBlsPubKey,
      maximumSignificantDigits: SIGNIFICANT_FIGURES.GAS_FEE_BREAKDOWN,
    });

  const gasPrice = gasPriceAddBlsPubKey ?? gasPriceProxyApproval;

  const { feeFormatted: feeEstimate, formula: feeFormula } = useNetworkFeeFormula({
    fee:
      feeProxyApproval || feeAddBlsPubKey
        ? (feeProxyApproval ?? 0n) + (feeAddBlsPubKey ?? 0n)
        : null,
    gasAmount:
      gasAmountProxyApproval || gasAmountAddBlsPubKey
        ? (gasAmountProxyApproval ?? 0n) + (gasAmountAddBlsPubKey ?? 0n)
        : null,
    gasPrice,
    maximumSignificantDigits: SIGNIFICANT_FIGURES.GAS_FEE_TOTAL,
  });

  const gasHighShowTooltip = !!(
    gasPrice && gasPrice > HANDRAIL_THRESHOLD_DYNAMIC(chainId).GAS_PRICE
  );

  const onSubmit = (data: SoloRegistrationFormSchema) => {
    try {
      setIsSubmitting(true);

      if (!isAddress(data.rewardsAddress)) {
        formSolo.setError('root', {
          type: 'manual',
          message: 'Rewards Address is not a valid Ethereum Address',
        });
        return;
      }

      if (!isAddress(address)) {
        formSolo.setError('root', {
          type: 'manual',
          message: 'Wallet Address is not a valid Ethereum Address',
        });
        return;
      }

      const contributors = [
        {
          staker: {
            addr: address,
            beneficiary: data.rewardsAddress,
          },
          stakedAmount: SESSION_NODE_FULL_STAKE_AMOUNT,
        },
      ] satisfies Array<RegisterNodeContributor>;

      setParams({
        contributors,
        blsPubKey: props.blsKey,
        blsSignature: props.blsSignature,
        nodePubKey: props.ed25519PubKey,
        userSignature: props.ed25519Signature,
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
          pubKey={rewardsAddress}
          force="collapse"
          alwaysShowCopyButton
          leadingChars={8}
          trailingChars={4}
          className="font-semibold"
        />
        <RegistrationEditButton
          aria-label={dictionaryRegistrationShared('buttonEditField.aria')}
          data-testid={ButtonDataTestId.Registration_Submit_Solo_Edit_Rewards_Address}
          tab={REG_TAB.REWARDS_ADDRESS_INPUT_SOLO}
        />
      </ActionModuleRow>
      <ActionModuleRow
        label={dictShared('stakeAmount')}
        tooltip={dictShared('stakeAmountDescription')}
      >
        <span className="inline-flex items-center gap-1.5">
          {balanceValue !== undefined && balanceValue < SESSION_NODE_FULL_STAKE_AMOUNT ? (
            <AlertTooltip
              tooltipContent={dictShared('notEnoughTokensAlert', {
                walletAmount: balance,
                tokenAmount: formatSENTBigInt(SESSION_NODE_FULL_STAKE_AMOUNT, 0),
              })}
            />
          ) : null}
          <span className="font-semibold">
            {formatSENTBigInt(SESSION_NODE_FULL_STAKE_AMOUNT, 0)}
          </span>
        </span>
      </ActionModuleRow>
      <ActionModuleFeeAccordionRow
        label={dictionaryFee('networkFee')}
        tooltip={dictionaryFee.rich('networkFeeTooltipWithFormula', {
          link: externalLink(URL.GAS_INFO),
          formula: () => (needsApproval ? feeFormula : formulaAddBlsPubKey),
        })}
        fees={[
          {
            label: dictShared('proxyApprovalCost'),
            fee: feeFormattedProxyApproval,
            tooltip: formulaProxyApproval,
            noFee: !needsApproval,
            noFeeReason: dictShared('proxyApprovalNotNeededTooltip', {
              amount: formatSENTBigInt(allowance, 0),
            }),
          },
          {
            label: dictionarySubmit('addBlsPubKeyCost'),
            fee: feeFormattedAddBlsPubKey,
            tooltip: formulaAddBlsPubKey,
          },
        ]}
        totalFee={needsApproval ? feeEstimate : feeFormattedAddBlsPubKey}
        hasMissingEstimatesTooltipContent={dictionaryFee('missingFees')}
        gasHighShowTooltip={gasHighShowTooltip}
        gasHighTooltip={dictionaryFee.rich('gasHigh', { link: externalLink(URL.GAS_INFO) })}
      />
      <Form {...formSolo}>
        <form onSubmit={formSolo.handleSubmit(onSubmit)} className={cn(params ? 'hidden' : '')}>
          <Button
            type="submit"
            className="w-full"
            data-testid={ButtonDataTestId.Registration_Submit_Solo_Confirm}
            aria-label={dictionaryRegistrationShared('buttonConfirmAndStake.aria')}
          >
            {dictionaryRegistrationShared('buttonConfirmAndStake.text')}
          </Button>
          <FormErrorMessage />
        </form>
      </Form>
      <ErrorBoundary errorComponent={ErrorSolo}>
        {params ? <SubmitSolo params={params} /> : null}
      </ErrorBoundary>
    </div>
  );
}

function SubmitSolo({ params }: { params: UseRegisterNodeParams }) {
  const dict = useTranslations('actionModules.registration.submitSolo');
  const dictShared = useTranslations('actionModules.shared');
  const { setIsSubmitting, setIsSuccess, changeTab, setIsError } = useRegistrationWizard();

  const {
    confirmations,
    remainingTimeEst,
    start: startConfirmationTracking,
  } = useConfirmationProgress();

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
      addBLSTransactionError ??
      addBLSWriteError ??
      addBLSSimulateError ??
      approveTransactionError ??
      approveWriteError ??
      approveSimulateError;

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
  };

  const isError =
    allowanceReadStatus === PROGRESS_STATUS.ERROR ||
    approveWriteStatus === PROGRESS_STATUS.ERROR ||
    addBLSStatus === PROGRESS_STATUS.ERROR;

  const handleRetry = () => {
    resetRegisterAndStake();
    registerAndStake();
  };

  /** Execute on mount */
  useEffect(() => {
    if (!enabled) {
      setIsSubmitting(true);
      registerAndStake();
    }
  }, []);

  useEffect(() => {
    if (addBLSStatus === PROGRESS_STATUS.SUCCESS) {
      startConfirmationTracking();
    }
  }, [addBLSStatus]);

  useEffect(() => {
    if (confirmations >= SESSION_NODE.GOAL_REGISTRATION_CONFIRMATIONS) {
      setIsSubmitting(false);
      setIsSuccess(true);
      changeTab(REG_TAB.SUCCESS_SOLO);
    }
  }, [confirmations]);

  useEffect(() => {
    if (isError) {
      handleError();
    }
  }, [isError]);

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

function useConfirmationProgress() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [confirmations, setConfirmations] = useState<number>(0);

  /**
   * TODO: replace this useEffect with a query to get real confirmation data once confirmation is implemented
   */
  useEffect(() => {
    if (enabled) {
      setInterval(
        () => setConfirmations((prev) => prev + 1),
        (20 * 60 * 1000) / SESSION_NODE.GOAL_REGISTRATION_CONFIRMATIONS
      );
    }
  }, [enabled]);

  const endDateEstimate = useMemo(
    () =>
      new Date(
        Date.now() +
          (SESSION_NODE.GOAL_REGISTRATION_CONFIRMATIONS - confirmations) *
            SESSION_NODE.REGISTRATION_MS_PER_CONFIRMATION_ESTIMATE
      ),
    [confirmations]
  );
  const remainingTimeEst = useRelativeTime(endDateEstimate);

  return {
    remainingTimeEst,
    confirmations,
    start: () => setEnabled(true),
  };
}

function ErrorSolo({ error }: ErrorBoxProps) {
  const dict = useTranslations('actionModules.registration.errorSolo');
  return <ErrorTabRegistration error={error} dict={dict} />;
}
