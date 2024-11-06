import { type Address } from 'viem';
import type { ContractWithAbiName } from './abis';
import { CHAIN } from './chains';

const contracts = [
  'RewardRatePool',
  'SENT',
  'ServiceNodeRewards',
  'ServiceNodeContributionFactory',
  'ServiceNodeContribution',
] as const satisfies Array<ContractWithAbiName>;
export type ContractName = (typeof contracts)[number];

// TODO - Replace Mainnet addresses with the correct addresses once they are available
export const addresses: Record<ContractName, Record<CHAIN, Address>> = {
  SENT: {
    /** @deprecated - The Mainnet value is a mock value */
    [CHAIN.MAINNET]: '0x70c1f36C9cEBCa51B9344121D284D85BE36CD6bB',
    /** @deprecated - The Eth value is a mock value */
    [CHAIN.ETHEREUM]: '0x70c1f36C9cEBCa51B9344121D284D85BE36CD6bB',
    [CHAIN.TESTNET]: '0x70c1f36C9cEBCa51B9344121D284D85BE36CD6bB',
  },
  ServiceNodeRewards: {
    /** @deprecated - The Mainnet value is a mock value */
    [CHAIN.MAINNET]: '0x4abfFB7f922767f22c7aa6524823d93FDDaB54b1',
    /** @deprecated - The Eth value is a mock value */
    [CHAIN.ETHEREUM]: '0x4abfFB7f922767f22c7aa6524823d93FDDaB54b1',
    [CHAIN.TESTNET]: '0x4abfFB7f922767f22c7aa6524823d93FDDaB54b1',
  },
  RewardRatePool: {
    /** @deprecated - The Mainnet value is a mock value */
    [CHAIN.MAINNET]: '0x38cD8D3F93d591C18cf26B3Be4CB2c872aC37953',
    /** @deprecated - The Eth value is a mock value */
    [CHAIN.ETHEREUM]: '0x38cD8D3F93d591C18cf26B3Be4CB2c872aC37953',
    [CHAIN.TESTNET]: '0x38cD8D3F93d591C18cf26B3Be4CB2c872aC37953',
  },
  ServiceNodeContributionFactory: {
    /** @deprecated - The Mainnet value is a mock value */
    [CHAIN.MAINNET]: '0x66d0D4f71267b3150DafF7bD486AC5E097E7E4C6',
    /** @deprecated - The Eth value is a mock value */
    [CHAIN.ETHEREUM]: '0x66d0D4f71267b3150DafF7bD486AC5E097E7E4C6',
    [CHAIN.TESTNET]: '0x66d0D4f71267b3150DafF7bD486AC5E097E7E4C6',
  },
  ServiceNodeContribution: {
    /** @deprecated - The Mainnet value is a mock value */
    [CHAIN.MAINNET]: '0x0000000000000000000000000000000000000000',
    /** @deprecated - The Eth value is a mock value */
    [CHAIN.ETHEREUM]: '0x0000000000000000000000000000000000000000',
    [CHAIN.TESTNET]: '0x0000000000000000000000000000000000000000',
  },
} as const;

export const SENT_DECIMALS = 9;
export const SENT_SYMBOL = 'SENT';
