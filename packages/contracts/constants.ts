import { type Address } from 'viem';
import type { ContractWithAbiName } from './abis';
import { arbitrum, arbitrumSepolia, mainnet } from 'viem/chains';

const contracts = [
  'RewardRatePool',
  'SENT',
  'ServiceNodeRewards',
  'ServiceNodeContributionFactory',
  'ServiceNodeContribution',
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
  SENT: {
    /** @deprecated - The Mainnet value is a mock value */
    [arbitrumChainId]: '0x70c1f36C9cEBCa51B9344121D284D85BE36CD6bB',
    /** @deprecated - The Eth value is a mock value */
    [ethChainId]: '0x70c1f36C9cEBCa51B9344121D284D85BE36CD6bB',
    [arbitrumSepoliaChainId]: '0x70c1f36C9cEBCa51B9344121D284D85BE36CD6bB',
  },
  ServiceNodeRewards: {
    /** @deprecated - The Mainnet value is a mock value */
    [arbitrumChainId]: '0x4abfFB7f922767f22c7aa6524823d93FDDaB54b1',
    /** @deprecated - The Eth value is a mock value */
    [ethChainId]: '0x4abfFB7f922767f22c7aa6524823d93FDDaB54b1',
    [arbitrumSepoliaChainId]: '0x4abfFB7f922767f22c7aa6524823d93FDDaB54b1',
  },
  RewardRatePool: {
    /** @deprecated - The Mainnet value is a mock value */
    [arbitrumChainId]: '0x38cD8D3F93d591C18cf26B3Be4CB2c872aC37953',
    /** @deprecated - The Eth value is a mock value */
    [ethChainId]: '0x38cD8D3F93d591C18cf26B3Be4CB2c872aC37953',
    [arbitrumSepoliaChainId]: '0x38cD8D3F93d591C18cf26B3Be4CB2c872aC37953',
  },
  ServiceNodeContributionFactory: {
    /** @deprecated - The Mainnet value is a mock value */
    [arbitrumChainId]: '0x66d0D4f71267b3150DafF7bD486AC5E097E7E4C6',
    /** @deprecated - The Eth value is a mock value */
    [ethChainId]: '0x66d0D4f71267b3150DafF7bD486AC5E097E7E4C6',
    [arbitrumSepoliaChainId]: '0x66d0D4f71267b3150DafF7bD486AC5E097E7E4C6',
  },
  ServiceNodeContribution: {
    /** @deprecated - The Mainnet value is a mock value */
    [arbitrumChainId]: '0x0000000000000000000000000000000000000000',
    /** @deprecated - The Eth value is a mock value */
    [ethChainId]: '0x0000000000000000000000000000000000000000',
    [arbitrumSepoliaChainId]: '0x0000000000000000000000000000000000000000',
  },
} as const;

export const SENT_DECIMALS = 9;
export const SENT_SYMBOL = 'SENT';
