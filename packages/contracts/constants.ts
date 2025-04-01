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

// TODO - Replace Mainnet addresses with the correct addresses once they are available
export const addresses: Record<ContractName, Record<ChainId, Address>> = {
  Token: {
    /** @deprecated - The Mainnet value is a mock value */
    [arbitrumChainId]: '0x7D7fD4E91834A96cD9Fb2369E7f4EB72383bbdEd',
    /** @deprecated - The Eth value is a mock value */
    [ethChainId]: '0x7D7fD4E91834A96cD9Fb2369E7f4EB72383bbdEd',
    [arbitrumSepoliaChainId]: '0x7D7fD4E91834A96cD9Fb2369E7f4EB72383bbdEd',
  },
  ServiceNodeRewards: {
    /** @deprecated - The Mainnet value is a mock value */
    [arbitrumChainId]: '0x9d8aB00880CBBdc2Dcd29C179779469A82E7be35',
    /** @deprecated - The Eth value is a mock value */
    [ethChainId]: '0x9d8aB00880CBBdc2Dcd29C179779469A82E7be35',
    [arbitrumSepoliaChainId]: '0x9d8aB00880CBBdc2Dcd29C179779469A82E7be35',
  },
  RewardRatePool: {
    /** @deprecated - The Mainnet value is a mock value */
    [arbitrumChainId]: '0xaAD853fE7091728dac0DAa7b69990ee68abFC636',
    /** @deprecated - The Eth value is a mock value */
    [ethChainId]: '0xaAD853fE7091728dac0DAa7b69990ee68abFC636',
    [arbitrumSepoliaChainId]: '0xaAD853fE7091728dac0DAa7b69990ee68abFC636',
  },
  ServiceNodeContributionFactory: {
    /** @deprecated - The Mainnet value is a mock value */
    [arbitrumChainId]: '0x36Ee2Da54a7E727cC996A441826BBEdda6336B71',
    /** @deprecated - The Eth value is a mock value */
    [ethChainId]: '0x36Ee2Da54a7E727cC996A441826BBEdda6336B71',
    [arbitrumSepoliaChainId]: '0x36Ee2Da54a7E727cC996A441826BBEdda6336B71',
  },
  ServiceNodeContribution: {
    /** @deprecated - The Mainnet value is a mock value */
    [arbitrumChainId]: '0x0000000000000000000000000000000000000000',
    /** @deprecated - The Eth value is a mock value */
    [ethChainId]: '0x0000000000000000000000000000000000000000',
    [arbitrumSepoliaChainId]: '0x0000000000000000000000000000000000000000',
  },
  TokenVestingStaking: {
    /** @deprecated - The Mainnet value is a mock value */
    [arbitrumChainId]: '0x0000000000000000000000000000000000000000',
    /** @deprecated - The Eth value is a mock value */
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
