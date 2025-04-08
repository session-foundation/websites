import { cn } from '@session/ui/lib/utils';
import type { CryptoAddressDisplaySchemaType } from '../schemas/fields/component/crypto-address-display';
import { type InputVariantProps } from '@session/ui/ui/input';
import { cleanSanityString } from '../lib/string';
import { ButtonDataTestId } from '../testing/data-test-ids';
import { CopyableInputDisplay } from '@session/ui/components/CopyableInputDisplay';
import Typography from '@session/ui/components/Typography';
import { EthIcon } from '@session/ui/icons/EthIcon';

function getIcon(value: CryptoAddressDisplaySchemaType) {
  if (!value.cryptoAddress?.icon) {
    return EthIcon;
  }
  switch (value.cryptoAddress.icon) {
    // TODO: Support other icons
    default:
      return EthIcon;
  }
}

export function SanityCryptoAddressDisplay({
  value,
  variant,
}: {
  value: CryptoAddressDisplaySchemaType;
} & InputVariantProps) {
  if (!value.cryptoAddress) {
    console.warn('Missing crypto address for crypto display');
    return null;
  }

  const IconComp = getIcon(value);

  return (
    <div
      className={cn(
        'group',
        'flex w-full flex-col align-middle sm:flex-row sm:items-center',
        'my-4 gap-2'
      )}
    >
      <div className="flex flex-row items-start gap-1 align-middle sm:hidden">
        <IconComp className="h-5 w-5" />
        <Typography variant="h4">{value.cryptoAddress.name}</Typography>
      </div>
      <IconComp className="hidden h-9 w-9 sm:block" />
      <CopyableInputDisplay
        className="text-xs sm:text-sm"
        value={value.cryptoAddress.address}
        copyToClipboardProps={{
          textToCopy: cleanSanityString(value.cryptoAddress.address),
          'data-testid': ButtonDataTestId.Crypto_Address_Copy_To_Clipboard,
        }}
        variant={variant}
      />
    </div>
  );
}
