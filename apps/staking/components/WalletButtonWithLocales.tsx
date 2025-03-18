'use client';

import { WalletButton, type WalletButtonProps } from '@session/wallet/components/WalletButton';
import { useTranslations } from 'next-intl';

export function WalletButtonWithLocales(props: Partial<WalletButtonProps>) {
  const dictionary = useTranslations('wallet.modalButton');
  return (
    <WalletButton
      disconnectedLabel={dictionary('connect')}
      connectedAriaLabel={dictionary('ariaConnected')}
      disconnectedAriaLabel={dictionary('ariaDisconnected')}
      {...props}
    />
  );
}
