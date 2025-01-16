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
  const dictionaryFee = useTranslations('fee');
  const dictionarySubmit = useTranslations('actionModules.registration.submitMulti');
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
    status: statusProxyApproval,
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
    beneficiary: address,
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
      label={dictionaryFee('networkFee')}
      tooltip={dictionaryFee.rich('networkFeeTooltipWithFormula', {
        link: externalLink(URL.GAS_INFO),
        formula: () => (needsApproval ? feeFormula : formulaContributeFunds),
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
          label: dictionarySubmit('contributeFundsCost'),
          fee: feeFormattedContributeFunds,
          tooltip: formulaContributeFunds,
        },
      ]}
      showDivider
      totalFee={needsApproval ? feeEstimate : feeFormattedContributeFunds}
      hasMissingEstimatesTooltipContent={dictionaryFee('missingFees')}
      gasHighShowTooltip={gasHighShowTooltip}
      gasHighTooltip={dictionaryFee.rich('gasHigh', { link: externalLink(URL.GAS_INFO) })}
    />
  );
}
