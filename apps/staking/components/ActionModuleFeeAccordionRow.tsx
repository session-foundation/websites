import { ActionModuleAccordionRow, ActionModuleTooltip } from '@/components/ActionModule';
import { AlertTooltip } from '@session/ui/ui/tooltip';
import { FuelIcon } from '@session/ui/icons/FuelIcon';
import { LoadingText } from '@session/ui/components/loading-text';
import type { ReactNode } from 'react';
import { TICKER } from '@/lib/constants';
import { cn } from '@session/ui/lib/utils';

export function ActionModuleFeeAccordionRow({
  label,
  tooltip,
  fees,
  totalFee,
  hasMissingEstimatesTooltipContent,
  gasHighTooltip,
  gasHighShowTooltip,
  showDivider,
}: {
  label: string;
  tooltip: ReactNode;
  fees: Array<{
    label: string;
    fee: ReactNode | null;
    tooltip: ReactNode | null;
    hasExemption?: boolean;
    exemptionReason?: string;
  }>;
  hasMissingEstimatesTooltipContent: ReactNode;
  gasHighShowTooltip?: boolean;
  gasHighTooltip?: ReactNode;
  totalFee: string | null;
  showDivider?: boolean;
}) {
  const hasMissingEstimates = fees.some(({ fee }) => fee === null);
  const exemptFromAllFees = fees.every(({ hasExemption }) => hasExemption);

  return (
    <ActionModuleAccordionRow
      label={label}
      tooltip={tooltip}
      last={!showDivider}
      accordionContent={
        <div className="flex flex-col gap-1">
          {fees.map(({ label, fee, tooltip, hasExemption, exemptionReason }) => (
            <span className="flex justify-between" key={label}>
              <span className="inline-flex items-center gap-2 text-nowrap align-middle">
                {label}
                <ActionModuleTooltip>{tooltip}</ActionModuleTooltip>
              </span>
              <span className="inline-flex items-center gap-2 text-nowrap align-middle">
                <span className={cn(hasExemption && 'line-through')}>{fee ?? '?'}</span>
                {hasExemption ? (
                  <>
                    <span>{`0 ${TICKER.ETH}`}</span>
                    <ActionModuleTooltip>{exemptionReason}</ActionModuleTooltip>
                  </>
                ) : null}
              </span>
            </span>
          ))}
        </div>
      }
    >
      <span className="inline-flex items-center gap-1.5 text-nowrap align-middle">
        {hasMissingEstimates ? (
          <AlertTooltip tooltipContent={hasMissingEstimatesTooltipContent} />
        ) : null}
        {gasHighShowTooltip ? <AlertTooltip tooltipContent={gasHighTooltip} /> : null}
        <FuelIcon className="h-3.5 w-3.5" />
        {totalFee ? (
          <span className="inline-flex items-center gap-2 text-nowrap align-middle">
            <span className={cn(exemptFromAllFees && 'line-through')}>{totalFee}</span>
            {exemptFromAllFees ? (
              <>
                <span>{`0 ${TICKER.ETH}`}</span>
                {/* NOTE: This is fine, len > 0 for exemptFromAllFees to be true */}
                <ActionModuleTooltip>{fees[0]?.exemptionReason}</ActionModuleTooltip>
              </>
            ) : null}
          </span>
        ) : (
          <LoadingText className="mr-8 scale-x-75 scale-y-50" />
        )}
      </span>
    </ActionModuleAccordionRow>
  );
}
