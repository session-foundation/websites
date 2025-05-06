import { ActionModuleRow } from '@/components/ActionModule';
import { useNetworkFeeFormula } from '@/hooks/useNetworkFeeFormula';
import { HANDRAIL_THRESHOLDS, SIGNIFICANT_FIGURES, URL } from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import { LoadingText } from '@session/ui/components/loading-text';
import { AlertTooltip } from '@session/ui/ui/tooltip';
import { useTranslations } from 'next-intl';

type ActionModuleFeeRowProps = {
  fee: bigint | null;
  gasAmount: bigint | null;
  gasPrice: bigint | null;
  last?: boolean;
  className?: string;
};

export default function ActionModuleFeeRow({
  fee,
  gasAmount,
  gasPrice,
  last,
  className,
}: ActionModuleFeeRowProps) {
  const dictionaryFee = useTranslations('fee');

  const { feeFormatted: feeEstimate, formula: feeFormula } = useNetworkFeeFormula({
    fee,
    gasAmount,
    gasPrice,
    maximumSignificantDigits: SIGNIFICANT_FIGURES.GAS_FEE_TOTAL,
  });

  const gasHighShowTooltip = !!(gasPrice && gasPrice > HANDRAIL_THRESHOLDS.GAS_PRICE);

  return typeof feeEstimate !== 'undefined' ? (
    <ActionModuleRow
      label={dictionaryFee('networkFee')}
      tooltip={dictionaryFee.rich('networkFeeTooltipWithFormula', {
        link: externalLink(URL.GAS_INFO),
        formula: () => feeFormula,
      })}
      containerClassName={className}
      last={last}
    >
      <span className="inline-flex flex-row items-center gap-1.5 align-middle">
        {gasHighShowTooltip ? (
          <AlertTooltip
            tooltipContent={dictionaryFee.rich('gasHigh', { link: externalLink(URL.GAS_INFO) })}
          />
        ) : null}
        {feeEstimate ? feeEstimate : <LoadingText className="mr-8 scale-x-75 scale-y-50" />}
      </span>
    </ActionModuleRow>
  ) : null;
}
