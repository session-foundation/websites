'use client';

import { forwardRef, type ReactNode, useState } from 'react';
import { createWeb3WalletConfig, QueryProvider, WalletProvider } from '@web3sheet/core';
import { arbitrum, arbitrumSepolia, mainnet, sepolia } from 'viem/chains';
import { Button, type ButtonProps } from '@session/ui/ui/button';
import { ArrowDownIcon } from '@session/ui/icons/ArrowDownIcon';
import { Avatar, AvatarFallback, AvatarImage } from '@session/ui/ui/avatar';
import { cn } from '@session/ui/lib/utils';
import type { DynamicTokenRowProps } from '@web3sheet/core/hooks/useWallet';
import type { Web3WalletComponentLibrary } from '@web3sheet/ui/lib/library';
import { Switch } from '@session/ui/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
} from '@session/ui/ui/sheet';

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
    <ArrowDownIcon className="fill-session-text mt-0.5 h-3 w-3 rotate-90" />
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
};

function TokenActionButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      <Button size="xs" variant="outline" data-testid="button:token-action">
        {children}
      </Button>
    </a>
  );
}

const tokenDetailsArbitrum: DynamicTokenRowProps = {
  tokenAddress: '0x7D7fD4E91834A96cD9Fb2369E7f4EB72383bbdEd',
  name: 'Session Token',
  iconSrc: '/images/token_logo.svg',
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
  iconSrc: '/images/token_logo.svg',
  symbolPrefix: 't',
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
  iconSrc: '/images/token_logo.svg',
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
  iconSrc: '/images/token_logo.svg',
  symbolPrefix: 't',
  network: {
    id: sepolia.id,
    name: 'Ethereum Sepolia',
    iconSrc: '/images/eth.svg',
    className: 'bg-session-white',
  },
  children: <TokenActionButton href="/bridge">Bridge</TokenActionButton>,
};

const tokenDetailsWOXENEthereum: DynamicTokenRowProps = {
  tokenAddress: '0xd1e2d5085b39b80c9948aeb1b9aa83af6756bcc5',
  name: 'Wrapped OXEN',
  iconSrc: '/images/woxen.svg',
  network: {
    id: mainnet.id,
    name: 'Ethereum',
    iconSrc: '/images/eth.svg',
    className: 'bg-session-white',
  },
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

export type Web3WalletProviderProps = {
  children: ReactNode;
  projectId: string;
  wagmiCookie?: string | undefined | null;
};

export function Web3WalletProvider({ children, projectId, wagmiCookie }: Web3WalletProviderProps) {
  const [config] = useState(createConfig(projectId));

  return (
    <WalletProvider config={config} wagmiCookie={wagmiCookie}>
      <QueryProvider>{children}</QueryProvider>
    </WalletProvider>
  );
}
