'use client';

import { useTranslations } from 'next-intl';
import { WalletButton, type WalletButtonProps } from '@session/wallet/components/WalletButton';

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
