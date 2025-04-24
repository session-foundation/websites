/* eslint-disable @typescript-eslint/no-duplicate-enum-values */

import {
  REG_MODE,
  REG_TAB,
  type UserSelectableRegistrationMode,
} from '@/app/register/[nodeId]/types';
import { Social, type SocialLink } from '@session/ui/components/SocialLinkList';
import { getEnvironmentTaggedDomain } from '@session/util-js/env';
import type { WalletSheetSettingDetails } from '@session/wallet/components/WalletUserSheet';
import { arbitrumSepolia, sepolia } from 'viem/chains';
import type { LocaleKey } from './locale-util';

export const BASE_URL = `https://${getEnvironmentTaggedDomain('stake')}.getsession.org`;

export enum URL {
  ARB_SEP_FAUCET = 'https://faucet.quicknode.com/arbitrum/sepolia',
  GAS_INFO = 'https://ethereum.org/en/developers/docs/gas',
  SESSION_NODE_DOCS = 'https://docs.getsession.org/session-nodes',
  INCENTIVE_PROGRAM = 'https://token.getsession.org/testnet-incentive-program',
  LEARN_MORE_DAILY_REWARDS = 'https://docs.getsession.org/staking-reward-pool#network-reward-rate',
  LEARN_MORE_TOTAL_REWARDS = 'https://docs.getsession.org/staking-reward-pool#network-reward-rate',
  LEARN_MORE_UNCLAIMED_REWARDS = 'https://docs.getsession.org/staking-reward-pool#claiming-rewards',
  OXEN_SERVICE_NODE_BONUS_PROGRAM = 'https://swap.oxen.io/',
  SESSION_TOKEN_COMMUNITY_SNAPSHOT = 'https://token.getsession.org/testnet-incentive-program',
  INCENTIVE_PROGRAM_TOS = 'https://token.getsession.org/incentive-program-terms',
  BUG_BOUNTY_PROGRAM = 'https://token.getsession.org/bug-bounty-program',
  TESTNET_REFERRALS = 'https://token.getsession.org/blog/testnet-referrals',
  TESTNET_REFERRALS_TOS = 'https://token.getsession.org/referral-program-terms',
  BUG_BOUNTY_TOS = 'https://token.getsession.org/bug-bounty-terms',
  SESSION_NODE_SOLO_SETUP_DOCS = 'https://docs.getsession.org/class-is-in-session/session-stagenet-single-contributor-node-setup',
  REMOVE_TOKEN_FROM_WATCH_LIST = 'https://support.metamask.io/managing-my-tokens/custom-tokens/how-to-remove-a-token/',
  NODE_LIQUIDATION_LEARN_MORE = 'https://docs.getsession.org/class-is-in-session/session-stagenet-single-contributor-node-setup#unlocking-your-stake',
}

export const LANDING_BUTTON_URL = {
  PRIMARY: '/stake',
  SECONDARY: URL.BUG_BOUNTY_PROGRAM,
};

export const TOS_LOCKED_PATHS = ['/stake', '/mystakes', '/register', '/faucet'];
export const VESTING_PATHS = ['/stake', '/mystakes', '/register'];

export enum COMMUNITY_DATE {
  SESSION_TOKEN_COMMUNITY_SNAPSHOT = '2024-06-12',
  OXEN_SERVICE_NODE_BONUS_PROGRAM = '2025-01-15',
}

export const SOCIALS = {
  [Social.Discord]: { name: Social.Discord, link: 'https://discord.com/invite/J5BTQdCfXN' },
  [Social.X]: { name: Social.X, link: 'https://x.com/session_token' },
  [Social.Youtube]: { name: Social.Youtube, link: 'https://www.youtube.com/@sessiontv' },
  [Social.Session]: { name: Social.Session, link: 'https://getsession.org/' },
  [Social.Github]: { name: Social.Github, link: 'https://github.com/session-foundation/websites' },
  [Social.RSS]: { name: Social.RSS, link: 'https://token.getsession.org/blog/feed' },
} satisfies Partial<Record<Social, SocialLink>>;

export enum FAUCET {
  MIN_ETH_BALANCE = 0.001,
  DRIP = 100_000,
}

export enum FAUCET_ERROR {
  INVALID_ADDRESS = 'invalidAddress',
  INCORRECT_CHAIN = 'incorrectChain',
  // INSUFFICIENT_ETH = 'insufficientEth',
  FAUCET_OUT_OF_TOKENS = 'faucetOutOfTokens',
  INVALID_SERVICE = 'invalidService',
  INVALID_OXEN_ADDRESS = 'invalidOxenAddress',
  ALREADY_USED = 'alreadyUsed',
  ALREADY_USED_SERVICE = 'alreadyUsedService',
  INVALID_REFERRAL_CODE = 'invalidReferralCode',
  REFERRAL_CODE_CANT_BE_USED_BY_CREATOR = 'referralCodeCantBeUsedByCreator',
  REFERRAL_CODE_OUT_OF_USES = 'referralCodeOutOfUses',
  REFERRAL_CODE_ALREADY_USED = 'referralCodeAlreadyUsed',
}

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
  stake: { dictionaryKey: 'stake', href: '/stake' },
  register: { dictionaryKey: 'register', href: '/register' },
  leaderboard: { dictionaryKey: 'leaderboard', href: '/leaderboard' },
  faucet: { dictionaryKey: 'faucet', href: '/faucet' },
} as const;

export const SSR_LINKS: LinkItem[] = Object.values(STATIC_LINKS);

export const DYNAMIC_LINKS = {
  myStakes: { dictionaryKey: 'myStakes', href: '/mystakes' },
  vestedStakes: { dictionaryKey: 'vestedStakes', href: '/vested-stakes' },
} as const;

export const EXTERNAL_ROUTES: LinkItem[] = [
  { dictionaryKey: 'tokenSite', href: 'https://token.getsession.org', linkType: 'external' },
  { dictionaryKey: 'support', href: '/support', linkType: 'external' },
  { dictionaryKey: 'docs', href: 'https://docs.getsession.org', linkType: 'external' },
  { dictionaryKey: 'explorer', href: 'https://stagenet.oxen.observer', linkType: 'external' },
] as const;

export enum QUERY {
  /** 5 seconds */
  STALE_TIME_DEFAULT = 5 * 1000,
  /** 1 second */
  STALE_TIME_DEFAULT_DEV = 1000,
  /** 1 second */
  STALE_TIME_REGISTRATIONS_LIST_DEV = 1000,
  /** 10 seconds */
  STALE_TIME_REGISTRATIONS_LIST = 10 * 1000,
  /** 2 minutes */
  STALE_TIME_CLAIM_REWARDS = 2 * 60 * 1000,
  /** 60 seconds */
  STALE_TIME_REMOTE_FEATURE_FLAGS = 60 * 1000,
}

/** 20,000 SENT  */
export const SESSION_NODE_FULL_STAKE_AMOUNT = 20_000_000000000n;
export const SESSION_NODE_MIN_STAKE_MULTI_OPERATOR = SESSION_NODE_FULL_STAKE_AMOUNT / 4n;
export const SESSION_NODE_MIN_STAKE_SOLO_OPERATOR = SESSION_NODE_FULL_STAKE_AMOUNT;

export const SIGNIFICANT_FIGURES = {
  GAS_FEE_TOTAL: 3,
  GAS_FEE_BREAKDOWN: 4,
};

export enum BLOCK_TIME_MS {
  ARBITRUM = 250,
  APPCHAIN = 1000 * 120,
}

export enum SESSION_NODE {
  /** Average millisecond per block (~2 minutes per block) */
  MS_PER_BLOCK = 2 * 60 * 1000,
  /** The number of confirmations required for a session network action */
  NETWORK_REQUIRED_CONFIRMATIONS = 5,
  /** Average network confirmation time. Time to get all confirmations. */
  NETWORK_CONFIRMATION_TIME_AVG_MS = 12 * 60 * 1000,
  /** Min Operator Fee */
  MIN_OPERATOR_FEE = 0,
  /** Max Operator Fee */
  MAX_OPERATOR_FEE = 100,
  /** Max contributors */
  MAX_CONTRIBUTORS = 10,
}

export enum SESSION_NODE_TIME_STATIC {
  /** 2 days in days */
  SMALL_CONTRIBUTOR_EXIT_REQUEST_WAIT_TIME_DAYS = 2,
  /** isSoon amount in seconds for time based notifications (2 minutes) */
  SOON_TIME = 120_000,
  /** 24 hours in ms */
  NON_FINALIZED_TIME_TO_REMOVE_STAKE_MS = 24 * 60 * 60 * 1000,
}

enum SESSION_NODE_TIME_TESTNET {
  /** 1 day in seconds */
  EXIT_REQUEST_TIME_SECONDS = 24 * 60 * 60,
  /** 2 hours in seconds (time between exit being available and liquidation being available) */
  EXIT_GRACE_TIME_SECONDS = 2 * 60 * 60,
  /** 2 days in seconds */
  DEREGISTRATION_LOCKED_STAKE_SECONDS = 2 * 24 * 60 * 60,
}

enum SESSION_NODE_TIME_MAINNET {
  /** 14 days in seconds */
  EXIT_REQUEST_TIME_SECONDS = 14 * 24 * 60 * 60,
  /** 7 days in seconds (time between exit being available and liquidation being available) */
  EXIT_GRACE_TIME_SECONDS = 7 * 24 * 60 * 60,
  /** 30 days in seconds */
  DEREGISTRATION_LOCKED_STAKE_SECONDS = 30 * 24 * 60 * 60,
}

export const SESSION_NODE_TIME = (chainId?: number) => {
  switch (chainId) {
    case arbitrumSepolia.id:
    case sepolia.id:
      return SESSION_NODE_TIME_TESTNET;

    default:
      return SESSION_NODE_TIME_MAINNET;
  }
};

export enum DYNAMIC_MODULE {
  /** The number of decimal places to round SENT values to */
  SENT_ROUNDED_DECIMALS = 2,
}

const MEDIAN_GAS_PRICE_ARBITRUM_ONE_2024 = 67681024783n;
const MEDIAN_GAS_PRICE_ARBITRUM_SEPOLIA_2024 = 1082870990n;

export const HANDRAIL_THRESHOLD = {
  /** 0.5 SESH */
  CLAIM_REWARDS_AMOUNT: 500000000n,
};

export const HANDRAIL_THRESHOLD_TESTNET = {
  GAS_PRICE: MEDIAN_GAS_PRICE_ARBITRUM_SEPOLIA_2024,
};

export const HANDRAIL_THRESHOLD_MAINNET = {
  GAS_PRICE: MEDIAN_GAS_PRICE_ARBITRUM_ONE_2024,
};

export const HANDRAIL_THRESHOLD_DYNAMIC = (chainId?: number) => {
  switch (chainId) {
    case arbitrumSepolia.id:
    case sepolia.id:
      return HANDRAIL_THRESHOLD_TESTNET;

    default:
      return HANDRAIL_THRESHOLD_MAINNET;
  }
};

export const preferenceStorageKey = 'stake_settings';
export const volatileStorageKey = 'volatile_storage';

export enum PREFERENCE {
  BACKEND_URL = 'backendUrl',
  PREF_REGISTRATION_MODE = 'prefRegistrationMode',
  SHOW_L2_HEIGHT_ON_STATUS_BAR = 'showL2HeightOnStatusBar',
  SKIP_VESTING_POPUP_ON_STARTUP = 'skipVestingPopupOnStartup',
  ANONYMIZE_UI = 'anonymizeUI',
  AUTO_REFRESH_BACKEND = 'autoRefreshBackend',
  OPEN_NODES_SHOW_AWAITING_OPERATOR = 'openNodesShowAwaitingOperator',
  V2_Rewards = 'v2Rewards',
}

export const preferenceStorageDefaultItems = {} as const;

type WalletSheetSettingDetailsGenerator = Record<
  PREFERENCE,
  Omit<WalletSheetSettingDetails, 'key'>
>;

export const prefDetails = {
  [PREFERENCE.AUTO_REFRESH_BACKEND]: {
    label: 'Auto Refresh',
    type: 'boolean',
    defaultValue: true,
  },
  [PREFERENCE.BACKEND_URL]: {
    label: 'Backend URL',
    type: 'string',
    defaultValue: '/api/ssb',
  },
  [PREFERENCE.PREF_REGISTRATION_MODE]: {
    label: 'Registration Mode',
    type: 'string',
    defaultValue: REG_MODE.EXPRESS as UserSelectableRegistrationMode,
  },
  [PREFERENCE.SHOW_L2_HEIGHT_ON_STATUS_BAR]: {
    label: 'Show L2 Height On Status Bar',
    type: 'boolean',
    defaultValue: false,
  },
  [PREFERENCE.SKIP_VESTING_POPUP_ON_STARTUP]: {
    label: 'Skip Vesting Popup On Startup',
    type: 'boolean',
    defaultValue: false,
    description: 'Disable the vesting popup on startup',
  },
  [PREFERENCE.ANONYMIZE_UI]: {
    label: 'Anonymize UI',
    type: 'boolean',
    defaultValue: false,
    description: 'Hide wallet addresses and other identifying information',
  },
  [PREFERENCE.OPEN_NODES_SHOW_AWAITING_OPERATOR]: {
    label: 'Show Awaiting Operator Nodes',
    type: 'boolean',
    defaultValue: false,
    description: 'Show awaiting operator contracts in the open nodes page',
  },
  [PREFERENCE.V2_Rewards]: {
    label: 'Use V2 Rewards Endpoint',
    type: 'boolean',
    defaultValue: false,
    description: 'Use the V2 rewards endpoint',
  },
} as const satisfies WalletSheetSettingDetailsGenerator;

const hiddenPreferences = [
  PREFERENCE.PREF_REGISTRATION_MODE,
  PREFERENCE.ANONYMIZE_UI,
  PREFERENCE.BACKEND_URL,
];

export const customSettings = Object.entries(prefDetails)
  .map(([key, value]) => ({
    ...value,
    key,
  }))
  .filter(({ key }) => !hiddenPreferences.includes(key as PREFERENCE));

export enum VOLATILE_STORAGE {
  NODES_CONFIRMING = 'nodesConfirming',
}

export const REGISTRATION_LINKS: Partial<Record<REG_TAB, string>> = {
  [REG_TAB.START]:
    'https://docs.getsession.org/user-guides/frequently-asked-questions-faq#what-is-the-minimum-and-maximum-i-can-stake-to-a-session-node-as-an-operator',
  [REG_TAB.STAKE_AMOUNT]:
    'https://docs.getsession.org/user-guides/frequently-asked-questions-faq#if-i-am-running-a-multicontributor-node-do-i-also-have-to-stake-session-tokens',
  [REG_TAB.OPERATOR_FEE]:
    'https://docs.getsession.org/user-guides/frequently-asked-questions-faq#what-is-the-multicontributor-operator-fee ',
  [REG_TAB.REWARDS_ADDRESS]:
    'https://docs.getsession.org/user-guides/frequently-asked-questions-faq#can-i-specify-a-separate-rewards-address-from-the-wallet-i-am-registering-my-node-with-or-staking-fr ',
  [REG_TAB.REWARDS_ADDRESS_INPUT_MULTI]:
    'https://docs.getsession.org/user-guides/frequently-asked-questions-faq#how-do-staking-rewards-and-operator-fees-get-sent-to-my-wallet-address ',
  [REG_TAB.REWARDS_ADDRESS_INPUT_SOLO]:
    'https://docs.getsession.org/user-guides/frequently-asked-questions-faq#how-do-staking-rewards-and-operator-fees-get-sent-to-my-wallet-address',
  [REG_TAB.RESERVE_SLOTS]:
    'https://docs.getsession.org/user-guides/frequently-asked-questions-faq#how-do-i-reserve-a-stake-for-specific-contributors-to-my-multicontributor-node ',
  [REG_TAB.RESERVE_SLOTS_INPUT]:
    'https://docs.getsession.org/user-guides/frequently-asked-questions-faq#how-many-contributors-can-i-reserve-stakes-for-on-my-multicontributor-node ',
  [REG_TAB.AUTO_ACTIVATE]:
    'https://docs.getsession.org/user-guides/frequently-asked-questions-faq#how-do-i-activate-my-node-once-it-is-fully-staked',
} as const;

export enum BACKEND {
  /** 30 seconds */
  L2_BACKGROUND_UPDATE_INTERVAL_SECONDS = 30,
  /** 2 minutes */
  NODE_TARGET_UPDATE_INTERVAL_SECONDS = 2 * 60,
  /** 2 seconds */
  MULTI_REGISTRATION_SN_POLL_INTERVAL_MS = 2 * 1000,
}

export enum LAST_UPDATED_BEHIND_TRIGGER {
  /** 2.5 minutes */
  BACKEND_LAST_BLOCK_WARNING = 2.5 * 60 * 1000,
  /** 4 minutes */
  BACKEND_LAST_BLOCK_ERROR = 4 * 60 * 1000,
  /** 2.5 minutes */
  BACKEND_L2_HEIGHT_WARNING = 2.5 * 60 * 1000,
  /** 3 minutes */
  BACKEND_L2_HEIGHT_ERROR = 3 * 60 * 1000,
}

export const allowedVestingRegistrationTabs = [
  REG_TAB.REWARDS_ADDRESS_INPUT_SOLO,
  REG_TAB.SUBMIT_SOLO,
  REG_TAB.SUCCESS_SOLO,
];
