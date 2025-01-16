import { ActionModuleAccordionRow, ActionModuleTooltip } from '@/components/ActionModule';
import { AlertTooltip } from '@session/ui/ui/tooltip';
import { FuelIcon } from '@session/ui/icons/FuelIcon';
import { LoadingText } from '@session/ui/components/loading-text';
import type { ReactNode } from 'react';
import { TICKER } from '@/lib/constants';

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
    noFee?: boolean;
    noFeeReason?: string;
  }>;
  hasMissingEstimatesTooltipContent: ReactNode;
  gasHighShowTooltip?: boolean;
  gasHighTooltip?: ReactNode;
  totalFee: string | null;
  showDivider?: boolean;
}) {
  const hasMissingEstimates = fees.some(({ fee }) => fee === null);
  return (
    <ActionModuleAccordionRow
      label={label}
      tooltip={tooltip}
      last={!showDivider}
      accordionContent={
        <div className="flex flex-col gap-1">
          {fees.map(({ label, fee, tooltip, noFee, noFeeReason }) => (
            <span className="flex justify-between" key={label}>
              <span className="inline-flex items-center gap-2 text-nowrap align-middle">
                {label}
                <ActionModuleTooltip>{tooltip}</ActionModuleTooltip>
              </span>
              <span className="inline-flex items-center gap-2 text-nowrap align-middle">
                {!noFee ? (
                  fee ?? '?'
                ) : (
                  <>
                    <span className="line-through">{fee ?? '?'}</span>
                    <span>{`0 ${TICKER.ETH}`}</span>
                    <ActionModuleTooltip>{noFeeReason}</ActionModuleTooltip>
                  </>
                )}
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
        {totalFee ? totalFee : <LoadingText className="mr-8 scale-x-75 scale-y-50" />}
      </span>
    </ActionModuleAccordionRow>
  );
}
