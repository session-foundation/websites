'use client';
import {
  Web3WalletProvider as _Web3WalletProvider,
  type Web3WalletProviderProps,
} from '@session/wallet/providers/web3wallet-provider';
import { getPreferencesStorage } from '@/providers/preferences-provider';

export default function Web3WalletProvider({
  children,
  ...props
}: Omit<Web3WalletProviderProps, 'settingsPreferenceStorage'>) {
  return (
    <_Web3WalletProvider {...props} settingsPreferenceStorage={getPreferencesStorage()}>
      {children}
    </_Web3WalletProvider>
  );
}
