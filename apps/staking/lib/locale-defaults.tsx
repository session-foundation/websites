import { CHAIN, chains, SENT_SYMBOL } from '@session/contracts';
import { Social } from '@session/ui/components/SocialLinkList';
import { cn } from '@session/ui/lib/utils';
import { RichTranslationValues } from 'next-intl';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { FAUCET, NETWORK, SESSION_NODE_TIME_STATIC, SOCIALS, TICKER, URL } from './constants';
import { LinkDataTestId } from '@/testing/data-test-ids';

export const internalLink = ({
  href,
  dataTestId,
  prefetch,
}: {
  href: string;
  dataTestId: string;
  prefetch?: boolean;
}) => {
  return (children: ReactNode) => (
    <Link
      href={href}
      prefetch={prefetch}
      data-testid={dataTestId}
      className="text-session-green cursor-pointer underline"
    >
      {children}
    </Link>
  );
};

export const externalLink = ({
  href,
  dataTestId,
  className,
}: {
  href: string;
  dataTestId: string;
  className?: string;
}) => {
  return (children: ReactNode) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={dataTestId}
      className={className ?? 'text-session-green cursor-pointer'}
    >
      {children}
    </a>
  );
};

const defaultExternalLink =
  ({
    href,
    text,
    dataTestId,
    className,
  }: {
    href: string;
    text: string;
    dataTestId: string;
    className?: string;
  }) =>
  () =>
    externalLink({
      href,
      dataTestId,
      className: className ?? 'text-white underline',
    })(text);

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
  'discord-server-link': defaultExternalLink({
    href: SOCIALS[Social.Discord].link,
    text: "Session Token's Discord server",
    dataTestId: LinkDataTestId.I18n_Discord_Server,
  }),
  'contact-support-link': defaultExternalLink({
    href: SOCIALS[Social.Discord].link,
    text: 'contact the Session team via Discord.',
    dataTestId: LinkDataTestId.I18n_Contact_Support,
  }),
  'incentive-program-link': defaultExternalLink({
    href: URL.INCENTIVE_PROGRAM,
    text: 'Session Testnet Incentive Program',
    dataTestId: LinkDataTestId.I18n_Incentive_Program,
  }),
  'gas-faucet-link': externalLink({
    href: URL.ARB_SEP_FAUCET,
    dataTestId: LinkDataTestId.I18n_Gas_Faucet,
    className: 'text-session-green',
  }),
  'gas-info-link': externalLink({
    href: URL.GAS_INFO,
    dataTestId: LinkDataTestId.I18n_Gas_Info,
    className: 'text-session-green',
  }),
  'oxen-program-link': defaultExternalLink({
    href: URL.OXEN_SERVICE_NODE_BONUS_PROGRAM,
    text: 'Oxen Service Node Bonus program',
    dataTestId: LinkDataTestId.I18n_Oxen_Program,
    className: 'text-session-green',
  }),
  'session-token-community-snapshot-link': defaultExternalLink({
    href: URL.SESSION_TOKEN_COMMUNITY_SNAPSHOT,
    text: 'Snapshot',
    dataTestId: LinkDataTestId.I18n_Session_Token_Community_Snapshot,
    className: 'text-session-green',
  }),
  'my-stakes-link': internalLink({
    href: '/mystakes',
    dataTestId: LinkDataTestId.I18n_My_Stakes,
  }),
} satisfies RichTranslationValues;

export const defaultTranslationVariables = {
  tokenSymbol: SENT_SYMBOL,
  gasTokenSymbol: TICKER.ETH,
  ethTokenSymbol: TICKER.ETH,
  mainnetName: NETWORK.MAINNET,
  testnetName: NETWORK.TESTNET,
  mainNetworkChain: chains[CHAIN.MAINNET].name,
  testNetworkChain: chains[CHAIN.TESTNET].name,
  minimumFaucetGasAmount: FAUCET.MIN_ETH_BALANCE,
  faucetDrip: FAUCET.DRIP,
  oxenProgram: 'Oxen Service Node Bonus program',
  notFoundContentType: 'page',
  smallContributorLeaveRequestDelay:
    SESSION_NODE_TIME_STATIC.SMALL_CONTRIBUTOR_EXIT_REQUEST_WAIT_TIME_DAYS,
} satisfies RichTranslationValues;

export const defaultTranslationValues: RichTranslationValues = {
  ...defaultTranslationElements,
  ...defaultTranslationVariables,
};
