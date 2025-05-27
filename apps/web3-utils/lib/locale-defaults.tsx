import { cn } from '@session/ui/lib/utils';
import type { RichTranslationValues } from 'next-intl';
import type { ReactNode } from 'react';
import { arbitrum, arbitrumSepolia } from 'viem/chains';
import { NETWORK, SESSION_NETWORK, TICKER } from './constants';

type FontWeight =
  | 'font-extralight'
  | 'font-light'
  | 'font-normal'
  | 'font-medium'
  | 'font-semibold'
  | 'font-bold'
  | 'font-extrabold'
  | 'font-black';

export const text = (weight?: FontWeight, className?: string) => {
  return (children: ReactNode) => <span className={cn(weight, className)}>{children}</span>;
};

export const defaultTranslationElements = {
  'text-extralight': text('font-extralight'),
  'text-light': text('font-light'),
  'text-normal': text('font-normal'),
  'text-medium': text('font-medium'),
  'text-semibold': text('font-semibold'),
  'text-bold': text('font-bold'),
  'text-extrabold': text('font-extrabold'),
  'text-black': text('font-black'),
  br: () => <br />,
} satisfies RichTranslationValues;

export const defaultTranslationVariables = {
  gas: 'Gas',
  gasPrice: 'Gas Price',
  gasTokenSymbol: TICKER.ETH,
  ethTokenSymbol: TICKER.ETH,
  mainnetName: NETWORK.MAINNET,
  testnetName: NETWORK.TESTNET,
  mainNetworkChain: arbitrum.name,
  testNetworkChain: arbitrumSepolia.name,
  sessionNetwork: SESSION_NETWORK,
  notFoundContentType: 'page',
} satisfies RichTranslationValues;

export const defaultTranslationValues: RichTranslationValues = {
  ...defaultTranslationElements,
  ...defaultTranslationVariables,
};
