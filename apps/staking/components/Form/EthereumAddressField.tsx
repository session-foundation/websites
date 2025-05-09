import { ActionModuleTooltip } from '@/components/ActionModule';
import type { InputDataTestId } from '@/testing/data-test-ids';
import { FormControl, FormItem, FormLabel, FormMessage } from '@session/ui/ui/form';
import { Input } from '@session/ui/ui/input';
import { useTranslations } from 'next-intl';
import { forwardRef } from 'react';
import { isAddress } from 'viem';
import { z } from 'zod';

export type BannedAddress = { address: string; errorMessage: string };

export type GetEthereumAddressFormFieldSchemaArgs = {
  required?: boolean;
  invalidAddressMessage?: string;
  bannedAddresses?: Array<BannedAddress>;
};

export const getEthereumAddressFormFieldSchema = ({
  required,
  invalidAddressMessage,
  bannedAddresses,
}: GetEthereumAddressFormFieldSchemaArgs) => {
  const dictionary = useTranslations('actionModules.ethAddress.validation');
  return z
    .string()
    .refine(
      (value) => {
        if (!value) return !required;
        return isAddress(value);
      },
      { message: invalidAddressMessage ?? dictionary('invalidAddress') }
    )
    .superRefine((value, ctx) => {
      if (!value) return !required;
      const bannedAddress = bannedAddresses?.find(({ address }) => address === value);
      if (bannedAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: bannedAddress.errorMessage,
        });
        return false;
      }
      return true;
    });
};

export type EthereumAddressFieldProps = {
  disabled?: boolean;
  field: never;
  // field: ControllerRenderProps<FieldValues, string>;
  label?: string;
  tooltip?: string;
  dataTestId: InputDataTestId;
};

export const EthereumAddressField = forwardRef<HTMLInputElement, EthereumAddressFieldProps>(
  ({ disabled, field, label, tooltip, dataTestId, ...props }, ref) => {
    return (
      <FormItem>
        {label ? (
          <FormLabel className="flex flex-row gap-1">
            {label}
            {tooltip ? <ActionModuleTooltip>{tooltip}</ActionModuleTooltip> : null}
          </FormLabel>
        ) : null}
        <FormControl>
          <Input
            disabled={disabled}
            className="w-full rounded-lg border-[#668C83] border-[2px] border-opacity-80 px-2 py-3 text-lg shadow-md"
            // @ts-expect-error -- TODO: type this
            {...field}
            ref={ref}
            data-testid={dataTestId}
            {...props}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }
);
