import { FeatureFlagProvider } from '@/lib/feature-flags-client';
import LocalizationProvider, { LocalizationProviderProps } from '@/providers/localization-provider';
import '@session/ui/styles';
import QueryProvider from '@/providers/query-provider';
import type { ReactNode } from 'react';
import TOSProvider from '@/providers/tos-provider';
import {
  Web3WalletProvider,
  type Web3WalletProviderProps,
} from '@session/wallet/providers/web3wallet-provider';
import { NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID } from '@/lib/env';
import { WalletButtonProvider } from '@session/wallet/providers/wallet-button-provider';
import PreferencesProvider from '@/providers/preferences-provider';
import StatusBarProvider from '@/components/StatusBar';
import ToasterProvider from '@session/ui/ui/sonner';

type GlobalProviderParams = Omit<Web3WalletProviderProps, 'projectId'> &
  Pick<LocalizationProviderProps, 'locale' | 'messages'> & {
    children: ReactNode;
  };

export async function GlobalProvider({
  children,
  wagmiCookie,
  messages,
  locale,
}: GlobalProviderParams) {
  return (
    <StatusBarProvider>
      <ToasterProvider>
        <PreferencesProvider>
          <QueryProvider>
            <FeatureFlagProvider>
              <LocalizationProvider messages={messages} locale={locale}>
                <WalletButtonProvider>
                  <Web3WalletProvider
                    wagmiCookie={wagmiCookie}
                    projectId={NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID}
                  >
                    <TOSProvider>{children}</TOSProvider>
                  </Web3WalletProvider>
                </WalletButtonProvider>
              </LocalizationProvider>
            </FeatureFlagProvider>
          </QueryProvider>
        </PreferencesProvider>
      </ToasterProvider>
    </StatusBarProvider>
  );
}
