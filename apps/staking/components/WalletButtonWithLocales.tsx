'use client';

import { WalletButton, type WalletButtonProps } from '@session/wallet/components/WalletButton';
import { useTranslations } from 'next-intl';

export default function WalletButtonWithLocales(props: Partial<WalletButtonProps>) {
  const dictWalletButton = useTranslations('wallet.modalButton');

  return (
    <WalletButton
      disconnectedLabel={dictWalletButton('connect')}
      connectedAriaLabel={dictWalletButton('ariaConnected')}
      disconnectedAriaLabel={dictWalletButton('ariaDisconnected')}
      {...props}
    />
  );
}
