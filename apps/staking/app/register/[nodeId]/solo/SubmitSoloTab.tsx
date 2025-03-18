import {
  type SoloRegistrationFormSchema,
  useRegistrationWizard,
} from '@/app/register/[nodeId]/Registration';
import { type ErrorBoxProps, ErrorTabRegistration } from '@/app/register/[nodeId]/shared/ErrorTab';
import { RegistrationEditButton } from '@/app/register/[nodeId]/shared/RegistrationEditButton';
import { SubmitSolo } from '@/app/register/[nodeId]/solo/SubmitSolo';
import { REG_TAB } from '@/app/register/[nodeId]/types';
import { ActionModuleRow } from '@/components/ActionModule';
import { ActionModuleFeeAccordionRow } from '@/components/ActionModuleFeeAccordionRow';
import { useNetworkFeeFormula } from '@/hooks/useNetworkFeeFormula';
import type { UseRegisterNodeParams } from '@/hooks/useRegisterNode';
import useRelativeTime from '@/hooks/useRelativeTime';
import {
  HANDRAIL_THRESHOLD_DYNAMIC,
  SESSION_NODE,
  SESSION_NODE_FULL_STAKE_AMOUNT,
  SIGNIFICANT_FIGURES,
  URL,
} from '@/lib/constants';
import { formatDate, formatLocalizedRelativeTimeToNowClient } from '@/lib/locale-client';
import { externalLink } from '@/lib/locale-defaults';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { addresses, isValidChainId } from '@session/contracts';
import {
  type RegisterNodeContributor,
  useAddBlsPubKeyFeeEstimate,
} from '@session/contracts/hooks/ServiceNodeRewards';
import {
  formatSENTBigInt,
  useAllowanceQuery,
  useProxyApprovalFeeEstimate,
} from '@session/contracts/hooks/Token';
import { PubKey } from '@session/ui/components/PubKey';
import { cn } from '@session/ui/lib/utils';
import { Button } from '@session/ui/ui/button';
import { Form, FormErrorMessage } from '@session/ui/ui/form';
import { AlertTooltip, Tooltip } from '@session/ui/ui/tooltip';
import { useWalletTokenBalance } from '@session/wallet/components/WalletButton';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import { useEffect, useMemo, useState } from 'react';
import { type Address, isAddress } from 'viem';

export function SubmitSoloTab() {
  const [params, setParams] = useState<UseRegisterNodeParams | null>(null);

  const { props, setIsSubmitting, formSolo, address } = useRegistrationWizard();
  const { chainId } = useWallet();
  const { balance, value: balanceValue } = useWalletTokenBalance();

  const dict = useTranslations('actionModules.registration.shared.submit');
  const dictSubmit = useTranslations('actionModules.registration.submitSolo');
  const dictFee = useTranslations('fee');
  const dictRegistrationShared = useTranslations('actionModules.registration.shared');
  const dictShared = useTranslations('actionModules.shared');
  const dictSessionNode = useTranslations('sessionNodes.general');

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
  } = useProxyApprovalFeeEstimate({
    contractAddress: contractAddress!,
    amount: SESSION_NODE_FULL_STAKE_AMOUNT,
  });

  const addBlsFeeParams = useMemo(() => {
    return {
      contributors: [
        {
          // This is fine, its to get the fee estimate
          staker: { addr: address, beneficiary: rewardsAddress as Address },
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
          pubKey={rewardsAddress}
          force="collapse"
          alwaysShowCopyButton
          leadingChars={8}
          trailingChars={4}
          className="font-semibold"
        />
        <RegistrationEditButton
          aria-label={dictRegistrationShared('buttonEditField.aria')}
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
        label={dictFee('networkFee')}
        tooltip={dictFee.rich('networkFeeTooltipWithFormula', {
          link: externalLink(URL.GAS_INFO),
          formula: () => (needsApproval ? feeFormula : formulaAddBlsPubKey),
        })}
        fees={[
          {
            label: dictShared('proxyApprovalCost'),
            fee: feeFormattedProxyApproval,
            tooltip: formulaProxyApproval,
            hasExemption: !needsApproval,
            exemptionReason: dictShared('proxyApprovalNotNeededTooltip', {
              amount: formatSENTBigInt(allowance, 0),
            }),
          },
          {
            label: dictSubmit('addBlsPubKeyCost'),
            fee: feeFormattedAddBlsPubKey,
            tooltip: formulaAddBlsPubKey,
          },
        ]}
        totalFee={needsApproval ? feeEstimate : feeFormattedAddBlsPubKey}
        hasMissingEstimatesTooltipContent={dictFee('missingFees')}
        gasHighShowTooltip={gasHighShowTooltip}
        gasHighTooltip={dictFee.rich('gasHigh', { link: externalLink(URL.GAS_INFO) })}
      />
      <Form {...formSolo}>
        <form onSubmit={formSolo.handleSubmit(onSubmit)} className={cn(params ? 'hidden' : '')}>
          <Button
            type="submit"
            className="w-full"
            data-testid={ButtonDataTestId.Registration_Submit_Solo_Confirm}
            aria-label={dictRegistrationShared('buttonConfirmAndStake.aria')}
          >
            {dictRegistrationShared('buttonConfirmAndStake.text')}
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

export function useConfirmationProgress() {
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
