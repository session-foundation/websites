'use client';
import { getPreferencesStorage } from '@/providers/preferences-provider';
import {
  type Web3WalletProviderProps,
  Web3WalletProvider as _Web3WalletProvider,
} from '@session/wallet/providers/web3wallet-provider';

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
