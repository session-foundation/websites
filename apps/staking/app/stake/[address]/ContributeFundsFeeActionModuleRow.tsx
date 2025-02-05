import { externalLink } from '@/lib/locale-defaults';
import { useTranslations } from 'next-intl';
import { ActionModuleFeeAccordionRow } from '@/components/ActionModuleFeeAccordionRow';
import { HANDRAIL_THRESHOLD_DYNAMIC, SIGNIFICANT_FIGURES, URL } from '@/lib/constants';
import { useWallet } from '@session/wallet/hooks/useWallet';
import type { ContributorContractInfo } from '@session/staking-api-js/client';
import {
  formatSENTBigInt,
  useAllowanceQuery,
  useProxyApprovalFeeEstimate,
} from '@session/contracts/hooks/Token';
import { useContributeFundsFeeEstimate } from '@session/contracts/hooks/ServiceNodeContribution';
import { useNetworkFeeFormula } from '@/hooks/useNetworkFeeFormula';
import type { Address } from 'viem';

export function ContributeFundsFeeActionModuleRow({
  contract,
  stakeAmount,
  minStake,
  maxStake,
}: {
  contract: ContributorContractInfo;
  stakeAmount: bigint;
  minStake: bigint;
  maxStake: bigint;
}) {
  const { chainId, address } = useWallet();
  const dictFee = useTranslations('fee');
  const dictSubmit = useTranslations('actionModules.registration.submitMulti');
  const dictShared = useTranslations('actionModules.shared');

  const { allowance } = useAllowanceQuery({
    contractAddress: contract.address,
    gcTime: Number.POSITIVE_INFINITY,
  });

  const needsApproval = !allowance || allowance < stakeAmount;

  const {
    fee: feeProxyApproval,
    gasAmount: gasAmountProxyApproval,
    gasPrice: gasPriceProxyApproval,
  } = useProxyApprovalFeeEstimate({
    contractAddress: contract.address,
    amount: maxStake,
  });

  const {
    fee: feeContributeFunds,
    gasPrice: gasPriceContributeFunds,
    gasAmount: gasAmountContributeFunds,
  } = useContributeFundsFeeEstimate({
    amount: minStake,
    // This is fine, its to get the fee estimate
    beneficiary: address as Address,
  });

  const { feeFormatted: feeFormattedProxyApproval, formula: formulaProxyApproval } =
    useNetworkFeeFormula({
      fee: feeProxyApproval,
      gasAmount: gasAmountProxyApproval,
      gasPrice: gasPriceProxyApproval,
      maximumSignificantDigits: SIGNIFICANT_FIGURES.GAS_FEE_BREAKDOWN,
    });

  const { feeFormatted: feeFormattedContributeFunds, formula: formulaContributeFunds } =
    useNetworkFeeFormula({
      fee: feeContributeFunds,
      gasAmount: gasAmountContributeFunds,
      gasPrice: gasPriceContributeFunds,
      maximumSignificantDigits: SIGNIFICANT_FIGURES.GAS_FEE_BREAKDOWN,
    });

  const gasPrice = gasPriceContributeFunds;

  const { feeFormatted: feeEstimate, formula: feeFormula } = useNetworkFeeFormula({
    fee:
      feeProxyApproval || feeContributeFunds
        ? (feeProxyApproval ?? 0n) + (feeContributeFunds ?? 0n)
        : null,
    gasAmount:
      gasAmountProxyApproval || gasAmountContributeFunds
        ? (gasAmountProxyApproval ?? 0n) + (gasAmountContributeFunds ?? 0n)
        : null,
    gasPrice,
    maximumSignificantDigits: SIGNIFICANT_FIGURES.GAS_FEE_TOTAL,
  });

  const gasHighShowTooltip = !!(
    gasPrice && gasPrice > HANDRAIL_THRESHOLD_DYNAMIC(chainId).GAS_PRICE
  );

  return (
    <ActionModuleFeeAccordionRow
      label={dictFee('networkFee')}
      tooltip={dictFee.rich('networkFeeTooltipWithFormula', {
        link: externalLink(URL.GAS_INFO),
        formula: () => (needsApproval ? feeFormula : formulaContributeFunds),
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
          label: dictSubmit('contributeFundsCost'),
          fee: feeFormattedContributeFunds,
          tooltip: formulaContributeFunds,
        },
      ]}
      showDivider
      totalFee={needsApproval ? feeEstimate : feeFormattedContributeFunds}
      hasMissingEstimatesTooltipContent={dictFee('missingFees')}
      gasHighShowTooltip={gasHighShowTooltip}
      gasHighTooltip={dictFee.rich('gasHigh', { link: externalLink(URL.GAS_INFO) })}
    />
  );
}
