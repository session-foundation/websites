import {
  type SoloRegistrationFormSchema,
  useRegistrationWizard,
} from '@/app/register/[nodeId]/Registration';
import { ErrorTabRegistration } from '@/app/register/[nodeId]/shared/ErrorTab';
import { RegistrationEditButton } from '@/app/register/[nodeId]/shared/RegistrationEditButton';
import { SubmitSoloVesting } from '@/app/register/[nodeId]/solo/SubmitSoloVesting';
import { SubmitSoloWallet } from '@/app/register/[nodeId]/solo/SubmitSoloWallet';
import { REG_TAB } from '@/app/register/[nodeId]/types';
import { useVestingUnstakedBalance } from '@/app/vested-stakes/modules/VestingUnstakedBalanceModule';
import { ActionModuleRow } from '@/components/ActionModule';
import { ActionModuleFeeAccordionRow } from '@/components/ActionModuleFeeAccordionRow';
import ActionModuleFeeRow from '@/components/ActionModuleFeeRow';
import type { ErrorBoxProps } from '@/components/Error/ErrorBox';
import { WalletInteractionButtonWithLocales } from '@/components/WalletInteractionButtonWithLocales';
import { WizardSectionDescription } from '@/components/Wizard';
import { useNetworkFeeFormula } from '@/hooks/useNetworkFeeFormula';
import type { UseRegisterNodeParams } from '@/hooks/useRegisterNode';
import useRelativeTime from '@/hooks/useRelativeTime';
import {
  HANDRAIL_THRESHOLDS,
  SESSION_NODE,
  SESSION_NODE_FULL_STAKE_AMOUNT,
  SIGNIFICANT_FIGURES,
  URL,
} from '@/lib/constants';
import { formatLocalizedRelativeTimeToNowClient, useFormatDate } from '@/lib/locale-client';
import { useActiveVestingContract } from '@/providers/vesting-provider';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { addresses, isValidChainId } from '@session/contracts';
import {
  type RegisterNodeContributor,
  type UseAddBlsPubKeyParams,
  useAddBlsPubKeyFeeEstimate,
} from '@session/contracts/hooks/ServiceNodeRewards';
import {
  formatSENTBigInt,
  useAllowanceQuery,
  useProxyApprovalFeeEstimate,
} from '@session/contracts/hooks/Token';
import {
  type UseVestingAddBlsPubKeyParams,
  useVestingAddBLSPubKeyFeeEstimate,
} from '@session/contracts/hooks/TokenVestingStaking';
import { PubKey } from '@session/ui/components/PubKey';
import { cn } from '@session/ui/lib/utils';
import { Form, FormErrorMessage } from '@session/ui/ui/form';
import { AlertTooltip, Tooltip } from '@session/ui/ui/tooltip';
import { useWalletTokenBalance } from '@session/wallet/components/WalletButton';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import { useMemo, useState } from 'react';
import { type Address, isAddress } from 'viem';

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: This is a complex component
export function SubmitSoloTab() {
  const [params, setParams] = useState<UseRegisterNodeParams | null>(null);

  const { props, setIsSubmitting, formSolo, address, vestingContract, isVestingMode } =
    useRegistrationWizard();
  const { chainId } = useWallet();
  const { balance: balanceWallet, value: balanceWalletValue } = useWalletTokenBalance();
  const { formattedAmount: balanceVesting, amount: balanceVestingValue } =
    useVestingUnstakedBalance();
  const activeVestingContract = useActiveVestingContract();

  const balanceValue = activeVestingContract ? balanceVestingValue : balanceWalletValue;
  const balance = activeVestingContract ? balanceVesting : balanceWallet;

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

  const { addBlsFeeParams, addBlsVestingFeeParams } = useMemo(() => {
    const addBlsFeeParams = {
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
    } satisfies UseAddBlsPubKeyParams;

    const addBlsVestingFeeParams = {
      blsPubKey: props.blsKey,
      blsSignature: props.blsSignature,
      nodePubKey: props.ed25519PubKey,
      userSignature: props.ed25519Signature,
      fee: 0,
      rewardsAddress: rewardsAddress as Address,
      vestingContractAddress: vestingContract?.address as Address,
    } satisfies UseVestingAddBlsPubKeyParams;

    return {
      addBlsFeeParams,
      addBlsVestingFeeParams,
    };
  }, [props, rewardsAddress, address, vestingContract]);

  const formattedPreparedAtDate = useFormatDate(props.preparedAt, {
    dateStyle: 'full',
    timeStyle: 'full',
  });

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

  const { feeFormatted: feeEstimate } = useNetworkFeeFormula({
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

  const {
    fee: feeVesting,
    gasPrice: gasPriceVesting,
    gasAmount: gasAmountVesting,
  } = useVestingAddBLSPubKeyFeeEstimate(addBlsVestingFeeParams);

  const gasHighShowTooltip = !!(gasPrice && gasPrice > HANDRAIL_THRESHOLDS.GAS_PRICE);

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
      ] as const satisfies Array<RegisterNodeContributor>;

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
      {isVestingMode ? (
        <ActionModuleFeeRow
          fee={feeVesting}
          gasAmount={gasAmountVesting}
          gasPrice={gasPriceVesting}
          last
        />
      ) : (
        <ActionModuleFeeAccordionRow
          label={dictFee('networkFee')}
          tooltip={
            <WizardSectionDescription
              className="text-base md:text-base"
              description={dictFee.rich('networkFeeTooltip', {
                linkOut: '',
              })}
              href={URL.GAS_INFO}
            />
          }
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
          gasHighTooltip={
            <WizardSectionDescription
              className="text-base md:text-base"
              description={dictFee.rich('gasHigh', {
                linkOut: '',
              })}
              href={URL.GAS_INFO}
            />
          }
        />
      )}
      <Form {...formSolo}>
        <form onSubmit={formSolo.handleSubmit(onSubmit)} className={cn(params ? 'hidden' : '')}>
          <WalletInteractionButtonWithLocales
            type="submit"
            className="w-full"
            data-testid={ButtonDataTestId.Registration_Submit_Solo_Confirm}
            aria-label={dictRegistrationShared('buttonConfirmAndStake.aria')}
          >
            {dictRegistrationShared('buttonConfirmAndStake.text')}
          </WalletInteractionButtonWithLocales>
          <FormErrorMessage />
        </form>
      </Form>
      <ErrorBoundary errorComponent={ErrorSolo}>
        {params ? (
          isVestingMode ? (
            <SubmitSoloVesting params={params} />
          ) : (
            <SubmitSoloWallet params={params} />
          )
        ) : null}
      </ErrorBoundary>
    </div>
  );
}

export function useConfirmationProgress(endTimestampMs?: number | null, addSuffix?: boolean) {
  const enabled = !!endTimestampMs;

  const endDateEstimate = useMemo(
    () => (endTimestampMs ? new Date(endTimestampMs) : null),
    [endTimestampMs]
  );

  const remainingTimeEst = useRelativeTime(endDateEstimate, { addSuffix });

  const confirmations = endDateEstimate
    ? Math.min(
        Math.floor(
          SESSION_NODE.NETWORK_REQUIRED_CONFIRMATIONS -
            (SESSION_NODE.NETWORK_REQUIRED_CONFIRMATIONS *
              (endDateEstimate.getTime() - Date.now())) /
              SESSION_NODE.NETWORK_CONFIRMATION_TIME_AVG_MS
        ),
        SESSION_NODE.NETWORK_REQUIRED_CONFIRMATIONS
      )
    : 0;

  return {
    remainingTimeEst,
    enabled,
    confirmations,
  };
}

export type UseConfirmationProgressReturn = ReturnType<typeof useConfirmationProgress>;

function ErrorSolo({ error }: ErrorBoxProps) {
  const dict = useTranslations('actionModules.registration.errorSolo');
  return <ErrorTabRegistration error={error} dict={dict} />;
}
