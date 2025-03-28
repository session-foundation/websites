'use client';

import { PubKey } from '@session/ui/components/PubKey';
import { ArrowDownIcon } from '@session/ui/icons/ArrowDownIcon';
import { cn } from '@session/ui/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@session/ui/ui/avatar';
import { Button, type ButtonProps } from '@session/ui/ui/button';
import { Input } from '@session/ui/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
} from '@session/ui/ui/sheet';
import { Switch } from '@session/ui/ui/switch';
import { Tooltip } from '@session/ui/ui/tooltip';
import {
  QueryProvider,
  WalletProvider,
  type WalletProviderProps,
  createWeb3WalletConfig,
} from '@web3sheet/core';
import type { DynamicTokenRowProps } from '@web3sheet/core/hooks/useWallet';
import type { Web3WalletComponentLibrary } from '@web3sheet/ui/lib/library';
import { type ReactNode, forwardRef, useState } from 'react';
import { arbitrum, arbitrumSepolia, mainnet, sepolia } from 'viem/chains';

const TabFullWidthButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => (
    <Button {...props} className={cn('w-full', className)} variant="outline" ref={ref}>
      {children}
    </Button>
  )
);

const ButtonWithIconSrc = forwardRef<HTMLButtonElement, ButtonProps & { src: string }>(
  ({ src, children, className, ...props }, ref) => (
    <TabFullWidthButton {...props} ref={ref} className={cn('relative', className)}>
      <div className="absolute h-6 w-6" style={{ left: '6px' }}>
        <Avatar className="h-6 w-6">
          <AvatarImage src={src} />
          <AvatarFallback className="bg-black" />
        </Avatar>
      </div>
      {children}
    </TabFullWidthButton>
  )
);

const ButtonWithIconReactNode = forwardRef<HTMLButtonElement, ButtonProps & { icon: ReactNode }>(
  ({ icon, children, className, ...props }, ref) => (
    <TabFullWidthButton {...props} ref={ref} className={cn('relative', className)}>
      <div className="absolute h-6 w-6" style={{ left: '6px' }}>
        {icon}
      </div>
      {children}
    </TabFullWidthButton>
  )
);

const BackButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <Button {...props} ref={ref} variant="ghost" size="icon">
    <ArrowDownIcon className="mt-0.5 h-3 w-3 rotate-90 fill-session-text" />
  </Button>
));

const componentLibrary: Web3WalletComponentLibrary = {
  // @ts-expect-error -- TODO: deal with data test ids
  TabFullWidthButton,
  // @ts-expect-error -- TODO: deal with data test ids
  ButtonWithIconReactNode,
  // @ts-expect-error -- TODO: deal with data test ids
  ButtonWithIconSrc,
  // @ts-expect-error -- TODO: deal with data test ids
  BackButton,
  Switch,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetOverlay,
  Input,
  PubKey,
  Tooltip,
};

function TokenActionButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      <Button
        size="xs"
        className="h-4 px-1.5"
        variant="outline"
        rounded="md"
        data-testid="button:token-action"
      >
        {children}
      </Button>
    </a>
  );
}

const tokenDetailsArbitrum: DynamicTokenRowProps = {
  tokenAddress: '0x7D7fD4E91834A96cD9Fb2369E7f4EB72383bbdEd',
  name: 'Session Token',
  iconSrc: 'https://stake.getsession.org/images/token_logo.svg',
  showAddTokenButton: true,
  network: {
    id: arbitrum.id,
    name: 'Arbitrum One',
    iconSrc: '/images/arbitrum.svg',
  },
  children: <TokenActionButton href="/stake">Stake</TokenActionButton>,
};

const tokenDetailsArbitrumSepolia: DynamicTokenRowProps = {
  tokenAddress: '0x7D7fD4E91834A96cD9Fb2369E7f4EB72383bbdEd',
  name: 'Session Token',
  iconSrc: 'https://stake.getsession.org/images/token_logo.svg',
  symbolPrefix: 't',
  showAddTokenButton: true,
  network: {
    id: arbitrumSepolia.id,
    name: 'Arbitrum Sepolia',
    iconSrc: '/images/arbitrum.svg',
  },
  children: <TokenActionButton href="/stake">Stake</TokenActionButton>,
};

const tokenDetailsEthereum: DynamicTokenRowProps = {
  tokenAddress: '0x0DBD22764C6C77827B4D03482998CA2dd61b5294',
  name: 'Session Token',
  iconSrc: 'https://stake.getsession.org/images/token_logo.svg',
  showAddTokenButton: true,
  network: {
    id: mainnet.id,
    name: 'Ethereum',
    iconSrc: '/images/eth.svg',
    className: 'bg-session-white',
  },
  children: <TokenActionButton href="/bridge">Bridge</TokenActionButton>,
};

const tokenDetailsEthereumSepolia: DynamicTokenRowProps = {
  tokenAddress: '0x0DBD22764C6C77827B4D03482998CA2dd61b5294',
  name: 'Session Token',
  iconSrc: 'https://stake.getsession.org/images/token_logo.svg',
  symbolPrefix: 't',
  showAddTokenButton: true,
  network: {
    id: sepolia.id,
    name: 'Ethereum Sepolia',
    iconSrc: '/images/eth.svg',
    className: 'bg-session-white',
  },
  children: <TokenActionButton href="/bridge">Bridge</TokenActionButton>,
};

const tokenDetailsWOXENEthereum: DynamicTokenRowProps = {
  tokenAddress: '0xd1e2d5085b39B80C9948AeB1b9aA83AF6756bcc5',
  name: 'Wrapped OXEN',
  iconSrc: 'https://stake.getsession.org/images/woxen.svg',
  network: {
    id: mainnet.id,
    name: 'Ethereum',
    iconSrc: '/images/eth.svg',
    className: 'bg-session-white',
  },
  hideIfZero: true,
  children: <TokenActionButton href="https://ethereum.oxen.io">Swap</TokenActionButton>,
};

const createConfig = (projectId: string) => {
  const config = createWeb3WalletConfig({
    wagmiConfig: {
      chains: [arbitrum, arbitrumSepolia, mainnet, sepolia],
    },
    walletConnectConfig: {
      projectId,
    },
    metaMaskConfig: {
      dappMetadata: {
        name: 'Session Wallet',
        url: 'https://stake.getsession.org',
      },
    },
  });

  config.componentLibrary = componentLibrary;
  config.tokens = [
    tokenDetailsArbitrum,
    tokenDetailsEthereum,
    tokenDetailsArbitrumSepolia,
    tokenDetailsEthereumSepolia,
    tokenDetailsWOXENEthereum,
  ];

  return config;
};

export type Web3WalletProviderProps = Omit<WalletProviderProps, 'config'> & {
  projectId: string;
  children: ReactNode;
};

export function Web3WalletProvider({
  children,
  projectId,
  wagmiCookie,
  settingsPreferenceStorage,
}: Web3WalletProviderProps) {
  const [config] = useState(createConfig(projectId));

  return (
    <WalletProvider
      settingsPreferenceStorage={settingsPreferenceStorage}
      config={config}
      wagmiCookie={wagmiCookie}
    >
      <QueryProvider>{children}</QueryProvider>
    </WalletProvider>
  );
}
