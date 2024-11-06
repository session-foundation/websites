import { SENT_DECIMALS } from '@session/contracts';
import { bigIntToNumber, bigIntToString, stringToBigInt } from '@session/util-crypto/maths';
import { FormControl, FormItem, FormMessage } from '@session/ui/ui/form';
import { ActionModuleTooltip } from '@/components/ActionModule';
import { AlertTooltip } from '@session/ui/ui/tooltip';
import { formatSENTBigInt } from '@session/contracts/hooks/SENT';
import { Button } from '@session/ui/ui/button';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Input } from '@session/ui/ui/input';
import { Slider, SliderLineCircle } from '@session/ui/ui/slider';
import * as React from 'react';
import type { DecimalDelimiter } from '@/lib/locale-client';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { SESSION_NODE_FULL_STAKE_AMOUNT } from '@/lib/constants';
import { useWallet } from '@session/wallet/hooks/wallet-hooks';

type GetStakeAmountFormFieldSchemaArgs = {
  minStake: bigint;
  maxStake: bigint;
  isOperator?: boolean;
  decimalDelimiter: DecimalDelimiter;
};

export const getStakeAmountFormFieldSchema = ({
  minStake,
  maxStake,
  isOperator,
  decimalDelimiter,
}: GetStakeAmountFormFieldSchemaArgs) => {
  const dictionary = useTranslations('actionModules.stakeAmount.validation');
  return z
    .string()
    .regex(/^[0-9]*[.,]?[0-9]*$/)
    .refine(
      (value) => stringToBigInt(value, SENT_DECIMALS, decimalDelimiter) >= minStake,
      dictionary(isOperator ? 'underMinOperator' : 'underMin', {
        min: formatSENTBigInt(minStake),
      })
    )
    .refine(
      (value) => stringToBigInt(value, SENT_DECIMALS, decimalDelimiter) <= maxStake,
      dictionary('overMax', {
        max: formatSENTBigInt(maxStake),
      })
    );
};

export type StakeAmountFieldProps = {
  disabled?: boolean;
  minStake: bigint;
  maxStake: bigint;
  decimalDelimiter: DecimalDelimiter;
  watchedStakeAmount: string;
  onChange: (value: string) => void;
  value: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is fine for now TODO: resolve properly
  field: any;
};

export default function StakeAmountField({
  disabled,
  minStake,
  maxStake,
  decimalDelimiter,
  watchedStakeAmount,
  onChange,
  value,
  field,
}: StakeAmountFieldProps) {
  const fullStake = SESSION_NODE_FULL_STAKE_AMOUNT;
  const fullStakeString = bigIntToString(fullStake, SENT_DECIMALS, decimalDelimiter);
  const dictionary = useTranslations('actionModules.register');
  const actionModuleSharedDictionary = useTranslations('actionModules.shared');
  const { tokenBalance, isConnected } = useWallet();

  const thousandsSeparator = decimalDelimiter === '.' ? ',' : '.';
  const formatInputText = (value: string) => {
    if (value === '0') return '0';
    // Remove non-numeric characters and non-decimal delimiters
    let formattedValue = value.replace(/[^0-9.,]/g, '');

    // Remove thousands separators
    if (formattedValue.includes(thousandsSeparator)) {
      formattedValue = formattedValue.replaceAll(thousandsSeparator, '');
    }

    // Remove any leading zeroes except when its `0.` leaving 1 zero if it's all zeros.
    if (formattedValue.startsWith('0') && !formattedValue.startsWith('0.')) {
      formattedValue = formattedValue.replace(/^0+(?=\d)/, '');
    }

    // Remove all but the first decimal delimiter
    if (formattedValue.includes(decimalDelimiter)) {
      const [first, ...rest] = formattedValue.split(decimalDelimiter);

      const decimalValue = rest.join('').slice(0, SENT_DECIMALS);

      formattedValue = `${first}${decimalDelimiter}${decimalValue}`;
      // If the value is greater than the full stake, return the full stake
    }

    if (stringToBigInt(formattedValue, SENT_DECIMALS, decimalDelimiter) > fullStake) {
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
                {actionModuleSharedDictionary('stakeAmountDescription')}
              </ActionModuleTooltip>
              {watchedStakeAmount &&
              tokenBalance &&
              tokenBalance < stringToBigInt(watchedStakeAmount, SENT_DECIMALS) ? (
                <AlertTooltip
                  tooltipContent={dictionary('notEnoughTokensAlert', {
                    walletAmount: formatSENTBigInt(tokenBalance),
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
                data-testid={ButtonDataTestId.Stake_Amount_Min}
                onClick={() =>
                  onChange(
                    formatInputText(bigIntToString(minStake, SENT_DECIMALS, decimalDelimiter))
                  )
                }
              >
                {dictionary.rich('minContribution', {
                  min: formatSENTBigInt(minStake),
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
                data-testid={ButtonDataTestId.Stake_Amount_Max}
                onClick={() =>
                  onChange(
                    formatInputText(bigIntToString(maxStake, SENT_DECIMALS, decimalDelimiter))
                  )
                }
              >
                {dictionary.rich('maxContribution', {
                  max: formatSENTBigInt(maxStake),
                })}
              </Button>
            </div>
          </div>
          <Input
            placeholder={bigIntToString(maxStake, SENT_DECIMALS)}
            disabled={!isConnected || disabled}
            className="w-full rounded-lg border-[2px] border-[#668C83] border-opacity-80 px-4 py-8 text-3xl shadow-md"
            value={value}
            onChange={(e) => onChange(formatInputText(e.target.value))}
            onPaste={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return onChange(formatInputText(e.clipboardData.getData('text/plain')));
            }}
            {...field}
          />
          <Slider
            className="my-2"
            max={bigIntToNumber(fullStake, SENT_DECIMALS)}
            step={1}
            disabled={disabled}
            value={[
              bigIntToNumber(stringToBigInt(value, SENT_DECIMALS, decimalDelimiter), SENT_DECIMALS),
            ]}
            onValueChange={([val]) => {
              if (!val) return;

              const distanceToMax = Math.abs(bigIntToNumber(maxStake, SENT_DECIMALS) - val);
              if (distanceToMax < 200) {
                return onChange(bigIntToString(maxStake, SENT_DECIMALS, decimalDelimiter));
              }

              const distanceToMin = Math.abs(bigIntToNumber(minStake, SENT_DECIMALS) - val);
              if (distanceToMin < 200) {
                return onChange(bigIntToString(minStake, SENT_DECIMALS, decimalDelimiter));
              }

              if (val < 200) {
                return onChange('0');
              }

              const distanceTo50 = Math.abs(bigIntToNumber(fullStake, SENT_DECIMALS) / 2 - val);
              if (distanceTo50 < 200) {
                return onChange(
                  bigIntToString(fullStake / BigInt(2), SENT_DECIMALS, decimalDelimiter)
                );
              }

              const distanceTo25 = Math.abs(bigIntToNumber(fullStake, SENT_DECIMALS) / 4 - val);
              if (distanceTo25 < 200) {
                return onChange(
                  bigIntToString(fullStake / BigInt(4), SENT_DECIMALS, decimalDelimiter)
                );
              }

              const distanceTo75 = Math.abs(
                (bigIntToNumber(fullStake, SENT_DECIMALS) / 4) * 3 - val
              );
              if (distanceTo75 < 200) {
                return onChange(
                  bigIntToString(
                    (fullStake / BigInt(4)) * BigInt(3),
                    SENT_DECIMALS,
                    decimalDelimiter
                  )
                );
              }

              const distanceTo100 = Math.abs(
                (bigIntToNumber(fullStake, SENT_DECIMALS) / 100) * 100 - val
              );
              if (distanceTo100 < 200) {
                return onChange(
                  bigIntToString(
                    (fullStake / BigInt(100)) * BigInt(100),
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
              style={{
                left: `calc(${(bigIntToNumber(maxStake, SENT_DECIMALS) / bigIntToNumber(fullStake, SENT_DECIMALS)) * 100}% - 8px)`,
              }}
            />
            <SliderLineCircle
              variant="blue"
              strokeVariant="blue"
              style={{
                left: `calc(${(bigIntToNumber(minStake, SENT_DECIMALS) / bigIntToNumber(fullStake, SENT_DECIMALS)) * 100}%)`,
              }}
            />
          </Slider>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
