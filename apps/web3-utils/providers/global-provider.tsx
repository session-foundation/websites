import LocalizationProvider, {
  type LocalizationProviderProps,
} from '@/providers/localization-provider';
import '@session/ui/styles';
import { NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID } from '@/lib/env';
import QueryProvider from '@/providers/query-provider';
import Web3WalletProvider from '@/providers/web3wallet-provider';
import ToasterProvider from '@session/ui/ui/sonner';
import { WalletButtonProvider } from '@session/wallet/providers/wallet-button-provider';
import type { Web3WalletProviderProps } from '@session/wallet/providers/web3wallet-provider';
import type { ReactNode } from 'react';

type GlobalProviderParams = Omit<Web3WalletProviderProps, 'projectId'> &
  Pick<LocalizationProviderProps, 'locale' | 'messages'> & {
    children: ReactNode;
  };

export function GlobalProvider({ children, wagmiCookie, messages, locale }: GlobalProviderParams) {
  return (
    <ToasterProvider>
      <QueryProvider>
        <LocalizationProvider messages={messages} locale={locale}>
          <WalletButtonProvider>
            <Web3WalletProvider
              wagmiCookie={wagmiCookie}
              projectId={NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID}
            >
              {children}
            </Web3WalletProvider>
          </WalletButtonProvider>
        </LocalizationProvider>
      </QueryProvider>
    </ToasterProvider>
  );
}
