import { ActionModuleTooltip } from '@/components/ActionModule';
import type { InputDataTestId } from '@/testing/data-test-ids';
import { FormControl, FormItem, FormLabel, FormMessage } from '@session/ui/ui/form';
import { Input } from '@session/ui/ui/input';
import { useTranslations } from 'next-intl';
import { isAddress } from 'viem';
import { z } from 'zod';

export type GetEthereumAddressFormFieldSchemaArgs = {
  required?: boolean;
  invalidAddressMessage?: string;
};

export const getEthereumAddressFormFieldSchema = ({
  required,
  invalidAddressMessage,
}: GetEthereumAddressFormFieldSchemaArgs) => {
  const dictionary = useTranslations('actionModules.ethAddress.validation');
  return z.string().refine(
    (value) => {
      if (!value) return !required;
      return isAddress(value);
    },
    { message: invalidAddressMessage ?? dictionary('invalidAddress') }
  );
};

export type EthereumAddressFieldProps = {
  disabled?: boolean;
  field: never;
  // field: ControllerRenderProps<FieldValues, string>;
  label?: string;
  tooltip?: string;
  dataTestId: InputDataTestId;
};

export default function EthereumAddressField({
  disabled,
  field,
  label,
  tooltip,
  dataTestId,
}: EthereumAddressFieldProps) {
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
          className="w-full rounded-lg border-[2px] border-[#668C83] border-opacity-80 px-2 py-3 text-lg shadow-md"
          // @ts-expect-error -- TODO: type this
          {...field}
          data-testid={dataTestId}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
