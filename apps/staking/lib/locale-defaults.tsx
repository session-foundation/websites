import { SENT_DECIMALS, SENT_SYMBOL, TOKEN } from '@session/contracts';
import { Social } from '@session/ui/components/SocialLinkList';
import { cn } from '@session/ui/lib/utils';
import { formatBigIntTokenValue } from '@session/util-crypto/maths';
import type { RichTranslationValues } from 'next-intl';
import Link from 'next/link';
import type { AriaRole, ReactNode } from 'react';
import { arbitrum, arbitrumSepolia } from 'viem/chains';
import {
  FAUCET,
  NETWORK,
  SESSION_NETWORK,
  SESSION_NODE_FULL_STAKE_AMOUNT,
  SESSION_NODE_MIN_STAKE_MULTI_OPERATOR,
  SESSION_NODE_MIN_STAKE_SOLO_OPERATOR,
  SESSION_NODE_TIME_STATIC,
  SOCIALS,
  TICKER,
  URL,
} from './constants';

export const internalLink = (href: string, prefetch?: boolean) => {
  return (children: ReactNode) => (
    <Link href={href} prefetch={prefetch} className="text-session-green cursor-pointer underline">
      {children}
    </Link>
  );
};

export const externalLink = (href: string, className?: string) => {
  return (children: ReactNode) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className ?? 'text-session-green cursor-pointer'}
    >
      {children}
    </a>
  );
};

export const clickableText = (onClick: () => void, role: AriaRole = 'button') => {
  return (children: ReactNode) => (
    <span className="text-session-green cursor-pointer underline" onClick={onClick} role={role}>
      {children}
    </span>
  );
};

const defaultExternalLink = (href: string, text: string, className?: string) => () =>
  externalLink(href, className ?? 'text-white underline')(text);

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
  br: (children: ReactNode) => <br />,
  'discord-server-link': defaultExternalLink(
    SOCIALS[Social.Discord].link,
    "Session Token's Discord server"
  ),
  'contact-support-link': defaultExternalLink(
    SOCIALS[Social.Discord].link,
    'contact the Session team via Discord.'
  ),
  'please-contract-support-link': defaultExternalLink(
    SOCIALS[Social.Discord].link,
    'please contract support',
    'text-session-green'
  ),
  'incentive-program-link': defaultExternalLink(
    URL.INCENTIVE_PROGRAM,
    'Session Testnet Incentive Program'
  ),
  'gas-faucet-link': externalLink(URL.ARB_SEP_FAUCET, 'text-session-green'),
  'gas-info-link': externalLink(URL.GAS_INFO, 'text-session-green'),
  'oxen-program-link': defaultExternalLink(
    URL.OXEN_SERVICE_NODE_BONUS_PROGRAM,
    'Oxen Service Node Bonus program',
    'text-session-green'
  ),
  'session-token-community-snapshot-link': defaultExternalLink(
    URL.SESSION_TOKEN_COMMUNITY_SNAPSHOT,
    'Snapshot',
    'text-session-green'
  ),
  'my-stakes-link': internalLink('/mystakes'),
} satisfies RichTranslationValues;

export const defaultTranslationVariables = {
  tokenSymbol: TOKEN.SYMBOL,
  gas: 'Gas',
  gasPrice: 'Gas Price',
  gasTokenSymbol: TICKER.ETH,
  ethTokenSymbol: TICKER.ETH,
  mainnetName: NETWORK.MAINNET,
  testnetName: NETWORK.TESTNET,
  mainNetworkChain: arbitrum.name,
  testNetworkChain: arbitrumSepolia.name,
  minimumFaucetGasAmount: FAUCET.MIN_ETH_BALANCE,
  faucetDrip: FAUCET.DRIP,
  sessionNetwork: SESSION_NETWORK,
  oxenProgram: 'Oxen Service Node Bonus program',
  notFoundContentType: 'page',
  smallContributorLeaveRequestDelay:
    SESSION_NODE_TIME_STATIC.SMALL_CONTRIBUTOR_EXIT_REQUEST_WAIT_TIME_DAYS,
  fullStateAmount: `${formatBigIntTokenValue(SESSION_NODE_FULL_STAKE_AMOUNT, SENT_DECIMALS, 0)} ${SENT_SYMBOL}`,
  minStakeSolo: `${formatBigIntTokenValue(SESSION_NODE_MIN_STAKE_SOLO_OPERATOR, SENT_DECIMALS, 0)} ${SENT_SYMBOL}`,
  minStakeMulti: `${formatBigIntTokenValue(SESSION_NODE_MIN_STAKE_MULTI_OPERATOR, SENT_DECIMALS, 0)} ${SENT_SYMBOL}`,
} satisfies RichTranslationValues;

export const defaultTranslationValues: RichTranslationValues = {
  ...defaultTranslationElements,
  ...defaultTranslationVariables,
};
