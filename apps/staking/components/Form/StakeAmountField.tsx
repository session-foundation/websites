import { useVestingUnstakedBalance } from '@/app/vested-stakes/modules/VestingUnstakedBalanceModule';
import { ActionModuleTooltip } from '@/components/ActionModule';
import { SESSION_NODE_FULL_STAKE_AMOUNT } from '@/lib/constants';
import { type DecimalDelimiter, useDecimalDelimiter } from '@/lib/locale-client';
import { useActiveVestingContract } from '@/providers/vesting-provider';
import type { ButtonDataTestId, InputDataTestId } from '@/testing/data-test-ids';
import { SENT_DECIMALS } from '@session/contracts';
import { formatSENTBigInt, formatSENTBigIntNoRounding } from '@session/contracts/hooks/Token';
import { Button } from '@session/ui/ui/button';
import { FormControl, FormItem, FormMessage } from '@session/ui/ui/form';
import { Input } from '@session/ui/ui/input';
import { Slider, SliderLineCircle } from '@session/ui/ui/slider';
import { AlertTooltip } from '@session/ui/ui/tooltip';
import { bigIntToNumber, bigIntToString, stringToBigInt } from '@session/util-crypto/maths';
import { useWalletTokenBalance } from '@session/wallet/components/WalletButton';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { forwardRef } from 'react';
import { z } from 'zod';

export type GetStakeAmountFormFieldSchemaArgs = {
  minStake: bigint;
  maxStake: bigint;
  isOperator?: boolean;
  decimalDelimiter: DecimalDelimiter;
  underMinMessage: string;
  underMinOperatorMessage: string;
  overMaxMessage: string;
};

export const getStakeAmountFormFieldSchema = ({
  minStake,
  maxStake,
  isOperator,
  decimalDelimiter,
  underMinMessage,
  underMinOperatorMessage,
  overMaxMessage,
}: GetStakeAmountFormFieldSchemaArgs) => {
  return z
    .string()
    .regex(/^[0-9]*[.,]?[0-9]*$/)
    .refine((value) => stringToBigInt(value, SENT_DECIMALS, decimalDelimiter) >= minStake, {
      message: isOperator ? underMinOperatorMessage : underMinMessage,
    })
    .refine((value) => stringToBigInt(value, SENT_DECIMALS, decimalDelimiter) <= maxStake, {
      message: overMaxMessage,
    });
};

export type StakeAmountFieldProps = {
  dataTestId: InputDataTestId;
  dataTestIds: {
    buttonMin: ButtonDataTestId;
    buttonMax: ButtonDataTestId;
    slider0: ButtonDataTestId;
    slider25: ButtonDataTestId;
    slider50: ButtonDataTestId;
    slider75: ButtonDataTestId;
    slider100: ButtonDataTestId;
    sliderMin: ButtonDataTestId;
    sliderMax: ButtonDataTestId;
  };
  disabled?: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: This is fine for now TODO: resolve properly
  field: any;
  maxStake: bigint;
  minStake: bigint;
  stickiness?: number;
  watchedStakeAmount: string;
  stakeAmountDescription?: string;
  ignoreBalance?: boolean;
};

const stakeAmountLeadingZerosRegex = /^0+(?=\d)/;
const stakeAmountNumericAndDelimitersRegex = /[^0-9.,]/g;

export const StakeAmountField = forwardRef<HTMLInputElement, StakeAmountFieldProps>(
  (
    {
      dataTestId,
      dataTestIds,
      disabled,
      field,
      maxStake,
      minStake,
      stickiness = 400,
      watchedStakeAmount,
      stakeAmountDescription,
      ignoreBalance,
      ...props
    },
    ref
  ) => {
    const dictionary = useTranslations('general');
    const dictionaryStakeAmount = useTranslations('actionModules.registration.stakeAmount');
    const actionModuleSharedDictionary = useTranslations('actionModules.shared');
    const { isConnected } = useWallet();

    const { value, onChange } = field;
    const decimalDelimiter = useDecimalDelimiter();
    const { balance: balanceWallet, value: balanceWalletValue } = useWalletTokenBalance();
    const { formattedAmount: balanceVesting, amount: balanceVestingValue } =
      useVestingUnstakedBalance();
    const activeVestingContract = useActiveVestingContract();

    const balanceValue = activeVestingContract ? balanceVestingValue : balanceWalletValue;
    const balance = activeVestingContract ? balanceVesting : balanceWallet;

    const fullStakeString = bigIntToString(
      SESSION_NODE_FULL_STAKE_AMOUNT,
      SENT_DECIMALS,
      decimalDelimiter
    );
    const thousandsSeparator = decimalDelimiter === '.' ? ',' : '.';
    const formatInputText = (value: string) => {
      if (value === '0') return '0';
      // Remove non-numeric characters and non-decimal delimiters
      let formattedValue = value.replace(stakeAmountNumericAndDelimitersRegex, '');

      // Remove thousands separators
      if (formattedValue.includes(thousandsSeparator)) {
        formattedValue = formattedValue.replaceAll(thousandsSeparator, '');
      }

      // Remove any leading zeroes except when its `0.` leaving 1 zero if it's all zeros.
      if (formattedValue.startsWith('0') && !formattedValue.startsWith('0.')) {
        formattedValue = formattedValue.replace(stakeAmountLeadingZerosRegex, '');
      }

      // Remove all but the first decimal delimiter
      if (formattedValue.includes(decimalDelimiter)) {
        const [first, ...rest] = formattedValue.split(decimalDelimiter);

        const decimalValue = rest.join('').slice(0, SENT_DECIMALS);

        formattedValue = `${first}${decimalDelimiter}${decimalValue}`;
        // If the value is greater than the full stake, return the full stake
      }

      if (
        stringToBigInt(formattedValue, SENT_DECIMALS, decimalDelimiter) >
        SESSION_NODE_FULL_STAKE_AMOUNT
      ) {
        return fullStakeString;
      }

      return formattedValue;
    };

    return (
      <FormItem className="flex flex-col">
        <FormControl>
          <div className="flex w-full flex-col items-center gap-2">
            <div className="flex w-full flex-col flex-wrap justify-between gap-2 text-nowrap md:flex-row">
              <span className="inline-flex items-center gap-2 text-nowrap align-middle">
                {actionModuleSharedDictionary('stakeAmount')}
                <ActionModuleTooltip>
                  {stakeAmountDescription ?? actionModuleSharedDictionary('stakeAmountDescription')}
                </ActionModuleTooltip>
                {!ignoreBalance &&
                watchedStakeAmount &&
                balanceValue !== undefined &&
                balanceValue < stringToBigInt(watchedStakeAmount, SENT_DECIMALS) ? (
                  <AlertTooltip
                    tooltipContent={dictionary('error.InsufficientBalance', {
                      walletAmount: balance,
                      tokenAmount: formatSENTBigInt(
                        stringToBigInt(watchedStakeAmount, SENT_DECIMALS)
                      ),
                    })}
                  />
                ) : null}
              </span>
              <div className="self-end">
                <Button
                  size="xs"
                  rounded="lg"
                  variant="ghost"
                  type="button"
                  className="gap-1 px-2"
                  disabled={disabled}
                  data-testid={dataTestIds.buttonMin}
                  onClick={() =>
                    onChange(
                      formatInputText(bigIntToString(minStake, SENT_DECIMALS, decimalDelimiter))
                    )
                  }
                >
                  {dictionaryStakeAmount.rich('min', {
                    min: formatSENTBigIntNoRounding(minStake),
                  })}
                </Button>
                {'|'}
                <Button
                  size="xs"
                  rounded="lg"
                  variant="ghost"
                  type="button"
                  className="gap-1 px-2"
                  disabled={disabled}
                  data-testid={dataTestIds.buttonMax}
                  onClick={() =>
                    onChange(
                      formatInputText(bigIntToString(maxStake, SENT_DECIMALS, decimalDelimiter))
                    )
                  }
                >
                  {dictionaryStakeAmount.rich('max', {
                    max: formatSENTBigIntNoRounding(maxStake),
                  })}
                </Button>
              </div>
            </div>
            <Input
              placeholder={bigIntToString(maxStake, SENT_DECIMALS)}
              disabled={!isConnected || disabled}
              className="w-full rounded-lg border-[#668C83] border-[2px] border-opacity-80 px-4 py-8 text-3xl shadow-md"
              {...field}
              value={value}
              onChange={(e) => onChange(formatInputText(e.target.value))}
              onPaste={(e) => {
                e.preventDefault();
                e.stopPropagation();
                return onChange(formatInputText(e.clipboardData.getData('text/plain')));
              }}
              ref={ref}
              data-testid={dataTestId}
              {...props}
            />
            <Slider
              className="my-2"
              max={bigIntToNumber(SESSION_NODE_FULL_STAKE_AMOUNT, SENT_DECIMALS)}
              step={1}
              disabled={disabled}
              value={[
                bigIntToNumber(
                  stringToBigInt(value, SENT_DECIMALS, decimalDelimiter),
                  SENT_DECIMALS
                ),
              ]}
              dataTestIds={{
                slider0: dataTestIds.slider0,
                slider25: dataTestIds.slider25,
                slider50: dataTestIds.slider50,
                slider75: dataTestIds.slider75,
                slider100: dataTestIds.slider100,
              }}
              onValueChange={([val]) => {
                if (!val) return;

                const distanceToMax = Math.abs(bigIntToNumber(maxStake, SENT_DECIMALS) - val);
                if (distanceToMax < stickiness) {
                  return onChange(bigIntToString(maxStake, SENT_DECIMALS, decimalDelimiter));
                }

                const distanceToMin = Math.abs(bigIntToNumber(minStake, SENT_DECIMALS) - val);
                if (distanceToMin < stickiness) {
                  return onChange(bigIntToString(minStake, SENT_DECIMALS, decimalDelimiter));
                }

                if (val < stickiness) {
                  return onChange('0');
                }

                const distanceTo50 = Math.abs(
                  bigIntToNumber(SESSION_NODE_FULL_STAKE_AMOUNT, SENT_DECIMALS) / 2 - val
                );
                if (distanceTo50 < stickiness) {
                  return onChange(
                    bigIntToString(
                      SESSION_NODE_FULL_STAKE_AMOUNT / BigInt(2),
                      SENT_DECIMALS,
                      decimalDelimiter
                    )
                  );
                }

                const distanceTo25 = Math.abs(
                  bigIntToNumber(SESSION_NODE_FULL_STAKE_AMOUNT, SENT_DECIMALS) / 4 - val
                );
                if (distanceTo25 < stickiness) {
                  return onChange(
                    bigIntToString(
                      SESSION_NODE_FULL_STAKE_AMOUNT / BigInt(4),
                      SENT_DECIMALS,
                      decimalDelimiter
                    )
                  );
                }

                const distanceTo75 = Math.abs(
                  (bigIntToNumber(SESSION_NODE_FULL_STAKE_AMOUNT, SENT_DECIMALS) / 4) * 3 - val
                );
                if (distanceTo75 < stickiness) {
                  return onChange(
                    bigIntToString(
                      (SESSION_NODE_FULL_STAKE_AMOUNT / BigInt(4)) * BigInt(3),
                      SENT_DECIMALS,
                      decimalDelimiter
                    )
                  );
                }

                const distanceTo100 = Math.abs(
                  (bigIntToNumber(SESSION_NODE_FULL_STAKE_AMOUNT, SENT_DECIMALS) / 100) * 100 - val
                );
                if (distanceTo100 < stickiness) {
                  return onChange(
                    bigIntToString(
                      (SESSION_NODE_FULL_STAKE_AMOUNT / BigInt(100)) * BigInt(100),
                      SENT_DECIMALS,
                      decimalDelimiter
                    )
                  );
                }

                return onChange(val.toString());
              }}
            >
              <SliderLineCircle
                variant="blue"
                strokeVariant="blue"
                data-testid={dataTestIds.sliderMax}
                style={{
                  left: `calc(${(bigIntToNumber(maxStake, SENT_DECIMALS) / bigIntToNumber(SESSION_NODE_FULL_STAKE_AMOUNT, SENT_DECIMALS)) * 100}% - 8px)`,
                }}
              />
              <SliderLineCircle
                variant="blue"
                strokeVariant="blue"
                data-testid={dataTestIds.sliderMin}
                style={{
                  left: `calc(${(bigIntToNumber(minStake, SENT_DECIMALS) / bigIntToNumber(SESSION_NODE_FULL_STAKE_AMOUNT, SENT_DECIMALS)) * 100}%)`,
                }}
              />
            </Slider>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }
);
