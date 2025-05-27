import type { ButtonProps } from '@session/ui/ui/button';
import { WalletInteractionButton } from '@session/wallet/components/WalletInteractionButton';
import { useTranslations } from 'next-intl';
import { forwardRef } from 'react';
import { arbitrum } from 'viem/chains';

const WalletInteractionButtonWithLocales = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const dict = useTranslations('wallet.walletInteractionButton');
    return (
      <WalletInteractionButton
        {...props}
        ref={ref}
        disconnectedChildren={dict('connectWallet')}
        incorrectChainChildren={dict('switchNetwork')}
        targetChainId={arbitrum.id}
      />
    );
  }
);

WalletInteractionButtonWithLocales.displayName = 'WalletInteractionButtonWithLocales';

export { WalletInteractionButtonWithLocales };
