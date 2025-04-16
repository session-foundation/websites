'use client';

import { NETWORK } from '@/lib/constants';
import logger from '@/lib/logger';
import { toast } from '@session/ui/lib/toast';
import WalletNetworkDropdown from '@session/wallet/components/WalletNetworkDropdown';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';

export function WalletNetworkDropdownWithLocales({ className }: { className?: string }) {
  const { isConnected } = useWallet();
  const dictionary = useTranslations('wallet.networkDropdown');

  // TODO - handle specific errors
  const handleError = (error: Error) => {
    logger.error(error);
    toast.error(dictionary('errorNotSupported'));
  };

  return isConnected ? (
    <WalletNetworkDropdown
      handleError={handleError}
      className={className}
      labels={{
        mainnet: NETWORK.MAINNET,
        testnet: NETWORK.TESTNET,
        invalid: dictionary('invalid'),
      }}
      ariaLabels={{
        mainnet: dictionary('ariaMainnet'),
        testnet: dictionary('ariaTestnet'),
        dropdown: dictionary('ariaDropdown'),
      }}
      variant="outline"
    />
  ) : null;
}
