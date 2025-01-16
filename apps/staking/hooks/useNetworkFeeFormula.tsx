import { safeTrySync } from '@session/util-js/try';
import { bigIntToNumber } from '@session/util-crypto/maths';
import { ETH_DECIMALS } from '@session/wallet/lib/eth';
import { formatNumber } from '@/lib/locale-client';
import { TICKER } from '@/lib/constants';
import { XIcon } from '@session/ui/icons/XIcon';
import { CopyToClipboardButton } from '@session/ui/components/CopyToClipboardButton';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { type ReactNode, useMemo } from 'react';

type UseNetworkFeeFormulaParams = {
  fee: bigint | null;
  gasAmount: bigint | null;
  gasPrice: bigint | null;
  maximumSignificantDigits?: number;
};

type UseNetworkFeeFormulaReturn = {
  feeNumber: number | null;
  feeFormatted: string | null;
  formula: ReactNode | null;
};

export function useNetworkFeeFormula({
  fee,
  gasAmount,
  gasPrice,
  maximumSignificantDigits = ETH_DECIMALS,
}: UseNetworkFeeFormulaParams): UseNetworkFeeFormulaReturn {
  const [feeNumber, feeFormatted] = useMemo(() => {
    if (!fee) return [null, null];

    const [err, num] = safeTrySync(() => bigIntToNumber(fee, ETH_DECIMALS));
    if (err) return [null, null];

    const [errFormat, str] = safeTrySync(() => formatNumber(num, { maximumSignificantDigits }));
    if (errFormat) return [null, null];

    const formatted = `${str} ${TICKER.ETH}`;

    return [num, formatted];
  }, [fee, maximumSignificantDigits]);

  const formula: ReactNode = useMemo(() => {
    if (!gasAmount || !gasPrice) return null;
    const gasAmountNumber = bigIntToNumber(gasAmount, 0);
    const gasPriceNumber = bigIntToNumber(gasPrice, ETH_DECIMALS);

    const gasAmountFormatted = formatNumber(gasAmountNumber);
    const gasPriceFormatted = formatNumber(gasPriceNumber, { minimumSignificantDigits: 1 });

    return (
      <span className="flex flex-row items-center gap-1">
        <span>{gasAmountFormatted}</span> <span className="italic">Gas</span>
        <XIcon className="h-4 w-4" /> <span>{gasPriceFormatted}</span>
        <span>{TICKER.ETH}</span> <span className="italic">Gas Price</span>
        <CopyToClipboardButton
          className="ms-0.5"
          textToCopy={`${gasAmountNumber}*${formatNumber(gasPriceNumber, { minimumSignificantDigits: ETH_DECIMALS })}`}
          data-testid={ButtonDataTestId.Network_Fee_Copy_Formula}
        />
      </span>
    );
  }, [gasAmount, gasPrice]);

  return {
    feeNumber,
    feeFormatted,
    formula,
  };
}
