'use client';

import type { ReadContractData } from 'wagmi/query';
import type { RewardRatePoolAbi } from '../abis';
import { type ContractReadQueryProps, useContractReadQuery } from './useContractReadQuery';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { arbitrum, arbitrumSepolia } from 'viem/chains';

type RewardRate = ReadContractData<typeof RewardRatePoolAbi, 'rewardRate', []>;

export type RewardRateQuery = ContractReadQueryProps & {
  /** The reward rate */
  rewardRate: RewardRate;
};

export function useRewardRateQuery(): RewardRateQuery {
  const { chainId } = useWallet();

  const { data: rewardRate, ...rest } = useContractReadQuery({
    contract: 'RewardRatePool',
    functionName: 'rewardRate',
    chainIdOverride: chainId === arbitrumSepolia.id ? arbitrumSepolia.id : arbitrum.id,
  });

  return {
    rewardRate,
    ...rest,
  };
}
