/* eslint-disable @typescript-eslint/no-duplicate-enum-values */

import { Social, type SocialLink } from '@session/ui/components/SocialLinkList';
import { getEnvironmentTaggedDomain } from '@session/util-js/env';
import type { LocaleKey } from './locale-util';

export const BASE_URL = `https://${getEnvironmentTaggedDomain('web3-utils')}.getsession.org`;

export enum URL {
  ARB_SEP_FAUCET = 'https://faucet.quicknode.com/arbitrum/sepolia',
  GAS_INFO = 'https://ethereum.org/en/developers/docs/gas',
  SESSION_NODE_DOCS = 'https://docs.getsession.org/session-nodes',
  DOCS = 'https://docs.getsession.org/',
}

export const SOCIALS = {
  [Social.Discord]: { name: Social.Discord, link: 'https://discord.gg/sessiontoken' },
  [Social.X]: { name: Social.X, link: 'https://x.com/session_token' },
  [Social.Youtube]: { name: Social.Youtube, link: 'https://www.youtube.com/@sessiontv' },
  [Social.Session]: { name: Social.Session, link: 'https://getsession.org/' },
  [Social.Github]: { name: Social.Github, link: 'https://github.com/session-foundation/websites' },
  [Social.RSS]: { name: Social.RSS, link: 'https://token.getsession.org/blog/feed' },
} satisfies Partial<Record<Social, SocialLink>>;

export enum TICKER {
  ETH = 'ETH',
}

export enum NETWORK {
  MAINNET = 'Mainnet',
  TESTNET = 'Testnet',
}

export const SESSION_NETWORK = 'Session Network' as const;

type LinkItem = {
  href: string;
  dictionaryKey: keyof Omit<LocaleKey['navigation'], 'hamburgerDropdown'>;
  linkType?: 'internal' | 'external';
};

export const STATIC_LINKS = {
  sign: { dictionaryKey: 'sign', href: '/sign' },
} as const;

export const SSR_LINKS: LinkItem[] = Object.values(STATIC_LINKS);

export const EXTERNAL_ROUTES: LinkItem[] = [
  { dictionaryKey: 'tokenSite', href: 'https://token.getsession.org', linkType: 'external' },
  { dictionaryKey: 'stakingSite', href: 'https://stake.getsession.org', linkType: 'external' },
  { dictionaryKey: 'support', href: 'https://stake.getsession.org/support', linkType: 'external' },
  { dictionaryKey: 'docs', href: 'https://docs.getsession.org', linkType: 'external' },
  { dictionaryKey: 'explorer', href: 'https://session.observer', linkType: 'external' },
  { dictionaryKey: 'bridgeArbitrum', href: '/bridge/arbitrum', linkType: 'external' },
] as const;

export enum BLOCK_TIME_MS {
  ARBITRUM = 250,
  APPCHAIN = 1000 * 120,
}
