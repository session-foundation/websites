import type { Address } from 'viem';
import { arbitrum, arbitrumSepolia, mainnet } from 'viem/chains';
import type { ContractWithAbiName } from './abis';

const contracts = [
  'RewardRatePool',
  'Token',
  'ServiceNodeRewards',
  'ServiceNodeContributionFactory',
  'ServiceNodeContribution',
  'TokenVestingStaking',
] as const satisfies Array<ContractWithAbiName>;
export type ContractName = (typeof contracts)[number];

const ethChainId = mainnet.id;
const arbitrumChainId = arbitrum.id;
const arbitrumSepoliaChainId = arbitrumSepolia.id;

export type ChainId = typeof ethChainId | typeof arbitrumChainId | typeof arbitrumSepoliaChainId;

export const isValidChainId = (chainId?: number | undefined): chainId is ChainId =>
  chainId === arbitrumChainId || chainId === arbitrumSepoliaChainId || chainId === ethChainId;

export const addresses: Record<ContractName, Record<ChainId, Address>> = {
  Token: {
    [arbitrumChainId]: '0x10Ea9E5303670331Bdddfa66A4cEA47dae4fcF3b',
    [ethChainId]: '0x10Ea9E5303670331Bdddfa66A4cEA47dae4fcF3b',
    [arbitrumSepoliaChainId]: '0x7D7fD4E91834A96cD9Fb2369E7f4EB72383bbdEd',
  },
  ServiceNodeRewards: {
    [arbitrumChainId]: '0xC2B9fC251aC068763EbDfdecc792E3352E351c00',
    /** @deprecated - The contract is not deployed on eth mainnet */
    [ethChainId]: '0x0000000000000000000000000000000000000000',
    [arbitrumSepoliaChainId]: '0x9d8aB00880CBBdc2Dcd29C179779469A82E7be35',
  },
  RewardRatePool: {
    [arbitrumChainId]: '0x11f040E89dFAbBA9070FFE6145E914AC68DbFea0',
    /** @deprecated - The contract is not deployed on eth mainnet */
    [ethChainId]: '0x0000000000000000000000000000000000000000',
    [arbitrumSepoliaChainId]: '0xaAD853fE7091728dac0DAa7b69990ee68abFC636',
  },
  ServiceNodeContributionFactory: {
    [arbitrumChainId]: '0x8129bE2D5eF7ACd39483C19F28DE86b7EF19DBCA',
    /** @deprecated - The contract is not deployed on eth mainnet */
    [ethChainId]: '0x0000000000000000000000000000000000000000',
    [arbitrumSepoliaChainId]: '0x36Ee2Da54a7E727cC996A441826BBEdda6336B71',
  },
  ServiceNodeContribution: {
    [arbitrumChainId]: '0x0000000000000000000000000000000000000000',
    [ethChainId]: '0x0000000000000000000000000000000000000000',
    [arbitrumSepoliaChainId]: '0x0000000000000000000000000000000000000000',
  },
  TokenVestingStaking: {
    [arbitrumChainId]: '0x0000000000000000000000000000000000000000',
    [ethChainId]: '0x0000000000000000000000000000000000000000',
    [arbitrumSepoliaChainId]: '0x0000000000000000000000000000000000000000',
  },
} as const;

export enum TOKEN {
  DECIMALS = 9,
  SYMBOL = 'SESH',
}

export const SENT_DECIMALS = 9;
export const SENT_SYMBOL = 'SESH';
