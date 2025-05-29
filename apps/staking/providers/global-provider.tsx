import { FeatureFlagProvider } from '@/lib/feature-flags-client';
import LocalizationProvider, {
  type LocalizationProviderProps,
} from '@/providers/localization-provider';
import '@session/ui/styles';
import StatusBarProvider from '@/components/StatusBar';
import {
  NEXT_PUBLIC_RPC_BATCH_ARB,
  NEXT_PUBLIC_RPC_BATCH_ETH,
  NEXT_PUBLIC_RPC_URL_ARB,
  NEXT_PUBLIC_RPC_URL_ETH,
  NEXT_PUBLIC_TESTNET,
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
} from '@/lib/env';
import PreferencesProvider from '@/providers/preferences-provider';
import QueryProvider from '@/providers/query-provider';
import TOSProvider from '@/providers/tos-provider';
import VestingProvider from '@/providers/vesting-provider';
import VolatileStorageProvider from '@/providers/volatile-storage-provider';
import Web3WalletProvider from '@/providers/web3wallet-provider';
import ToasterProvider from '@session/ui/ui/sonner';
import { WalletButtonProvider } from '@session/wallet/providers/wallet-button-provider';
import type { Web3WalletProviderProps } from '@session/wallet/providers/web3wallet-provider';
import type { ReactNode } from 'react';

type GlobalProviderParams = Omit<Web3WalletProviderProps, 'walletSheetConfig'> &
  Pick<LocalizationProviderProps, 'locale' | 'messages'> & {
    children: ReactNode;
  };

export function GlobalProvider({ children, wagmiCookie, messages, locale }: GlobalProviderParams) {
  return (
    <ToasterProvider>
      <VolatileStorageProvider>
        <PreferencesProvider>
          <QueryProvider>
            <FeatureFlagProvider>
              <LocalizationProvider messages={messages} locale={locale}>
                <WalletButtonProvider>
                  <Web3WalletProvider
                    wagmiCookie={wagmiCookie}
                    walletSheetConfig={{
                      testnet: NEXT_PUBLIC_TESTNET,
                      projectId: NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
                      arbRpcUrl: NEXT_PUBLIC_RPC_URL_ARB,
                      ethRpcUrl: NEXT_PUBLIC_RPC_URL_ETH,
                      arbRpcBatchCalls: NEXT_PUBLIC_RPC_BATCH_ARB,
                      ethRpcBatchCalls: NEXT_PUBLIC_RPC_BATCH_ETH,
                    }}
                  >
                    <VestingProvider>
                      <StatusBarProvider>
                        <TOSProvider>{children}</TOSProvider>
                      </StatusBarProvider>
                    </VestingProvider>
                  </Web3WalletProvider>
                </WalletButtonProvider>
              </LocalizationProvider>
            </FeatureFlagProvider>
          </QueryProvider>
        </PreferencesProvider>
      </VolatileStorageProvider>
    </ToasterProvider>
  );
}
