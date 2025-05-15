'use client';

import { useWallet } from '@session/wallet/hooks/useWallet';
import { useMemo } from 'react';
import type { Address } from 'viem';
import { arbitrum, arbitrumSepolia } from 'viem/chains';
import type { ReadContractData } from 'wagmi/query';
import type { ServiceNodeRewardsAbi } from '../abis';
import {
  encodeBlsPubKey,
  encodeBlsSignature,
  encodeED25519PubKey,
  encodeED25519Signature,
} from '../util';
import { type ContractReadQueryProps, mergeContractReadStatuses, useContractReadQuery } from './useContractReadQuery';
import { type ContractWriteQueryProps, useContractWriteQuery } from './useContractWriteQuery';
import { useEstimateContractFee } from './useEstimateContractFee';

export type ClaimRewardsQuery = ContractWriteQueryProps & {
  /** Claim rewards */
  claimRewards: () => void;
};

export function useClaimRewardsQuery({
  vestingContractAddress,
}: {
  vestingContractAddress?: Address;
}): ClaimRewardsQuery {
  const { simulateAndWriteContract, ...rest } = useContractWriteQuery({
    contract: vestingContractAddress ? 'TokenVestingStaking' : 'ServiceNodeRewards',
    functionName: 'claimRewards',
    addressOverride: vestingContractAddress,
  });

  return {
    claimRewards: simulateAndWriteContract,
    ...rest,
  };
}

export type UpdateRewardsBalanceArgs = {
  address: Address;
  rewards: bigint;
  blsSignature: string;
  excludedSigners: Array<bigint>;
};

export type UpdateRewardsBalanceQuery = ContractWriteQueryProps & {
  /** Update rewards balance */
  updateRewardsBalance: (args?: UpdateRewardsBalanceArgs) => void;
};

export function useUpdateRewardsBalanceQuery(
  // NOTE: default args are required to get the gas estimate
  defaultArgs?: UpdateRewardsBalanceArgs
): UpdateRewardsBalanceQuery {
  const defaultBlsSignature = useMemo(
    () => (defaultArgs?.blsSignature ? encodeBlsSignature(defaultArgs.blsSignature) : null),
    [defaultArgs]
  );

  const { simulateAndWriteContract, ...rest } = useContractWriteQuery({
    contract: 'ServiceNodeRewards',
    functionName: 'updateRewardsBalance',
    ...(defaultArgs && defaultBlsSignature
      ? {
          args: [
            defaultArgs.address,
            defaultArgs.rewards,
            defaultBlsSignature,
            defaultArgs.excludedSigners,
          ],
        }
      : {}),
  });

  const updateRewardsBalance = (args?: UpdateRewardsBalanceArgs) => {
    const _args = args ?? defaultArgs;
    if (!_args) {
      throw new Error('updateRewardsBalance called without args');
    }

    return simulateAndWriteContract([
      _args.address,
      _args.rewards,
      encodeBlsSignature(_args.blsSignature),
      _args.excludedSigners,
    ] as const);
  };

  return {
    updateRewardsBalance,
    ...rest,
  };
}

export type TotalNodesQuery = ContractReadQueryProps & {
  /** The total number of nodes */
  totalNodes: ReadContractData<typeof ServiceNodeRewardsAbi, 'totalNodes', []>;
};

export function useTotalNodesQuery(): TotalNodesQuery {
  const { chainId } = useWallet();

  const { data: totalNodes, ...rest } = useContractReadQuery({
    contract: 'ServiceNodeRewards',
    functionName: 'totalNodes',
    chainIdOverride: chainId === arbitrumSepolia.id ? arbitrumSepolia.id : arbitrum.id,
  });

  return {
    totalNodes,
    ...rest,
  };
}

export type UseAddBLSPubKeyReturn = ContractWriteQueryProps & {
  addBLSPubKey: () => void;
};

export type RegisterNodeContributor = {
  staker: { addr: Address; beneficiary: Address };
  stakedAmount: bigint;
};

export type UseAddBlsPubKeyParams = {
  blsPubKey: string;
  blsSignature: string;
  nodePubKey: string;
  userSignature: string;
  fee?: number;
  /** Contributors to the node, requires at least one contributor */
  contributors: Array<RegisterNodeContributor> & { [0]: RegisterNodeContributor };
};

export function encodeAddBlsPubKeyArgs({
  blsPubKey,
  blsSignature,
  nodePubKey,
  userSignature,
  fee,
}: Omit<Required<UseAddBlsPubKeyParams>, 'contributors'>) {
  const encodedBlsPubKey = encodeBlsPubKey(blsPubKey);
  const encodedBlsSignature = encodeBlsSignature(blsSignature);
  const { pubKey } = encodeED25519PubKey(nodePubKey);
  const { sigs0, sigs1 } = encodeED25519Signature(userSignature);

  const encodedNodeParams = {
    serviceNodePubkey: pubKey,
    serviceNodeSignature1: sigs0,
    serviceNodeSignature2: sigs1,
    fee,
  };

  return {
    encodedBlsPubKey,
    encodedBlsSignature,
    encodedNodeParams,
  };
}

export function useAddBLSPubKey({
  blsPubKey,
  blsSignature,
  nodePubKey,
  userSignature,
  fee = 0,
  contributors,
}: UseAddBlsPubKeyParams): UseAddBLSPubKeyReturn {
  const { encodedBlsPubKey, encodedBlsSignature, encodedNodeParams } = useMemo(() => {
    return encodeAddBlsPubKeyArgs({
      blsPubKey,
      blsSignature,
      nodePubKey,
      userSignature,
      fee,
    });
  }, [blsPubKey, blsSignature, nodePubKey, userSignature, fee]);

  const { simulateAndWriteContract, ...rest } = useContractWriteQuery({
    contract: 'ServiceNodeRewards',
    functionName: 'addBLSPublicKey',
    args: [encodedBlsPubKey, encodedBlsSignature, encodedNodeParams, contributors],
  });

  return {
    addBLSPubKey: simulateAndWriteContract,
    ...rest,
  };
}

export function useAddBlsPubKeyFeeEstimate({
  blsPubKey,
  blsSignature,
  nodePubKey,
  userSignature,
  fee = 0,
  contributors,
}: UseAddBlsPubKeyParams) {
  const { encodedBlsPubKey, encodedBlsSignature, encodedNodeParams } = useMemo(() => {
    return encodeAddBlsPubKeyArgs({
      blsPubKey,
      blsSignature,
      nodePubKey,
      userSignature,
      fee,
    });
  }, [blsPubKey, blsSignature, nodePubKey, userSignature, fee]);

  return useEstimateContractFee({
    contract: 'ServiceNodeRewards',
    functionName: 'addBLSPublicKey',
    args: [encodedBlsPubKey, encodedBlsSignature, encodedNodeParams, contributors],
  });
}

export type UseInitiateRemoveBLSPublicKeyReturn = ContractWriteQueryProps & {
  initiateRemoveBLSPublicKey: () => void;
};

export function useInitiateRemoveBLSPublicKey({
  contractId,
  vestingContractAddress,
}: {
  contractId: number;
  vestingContractAddress?: Address;
}): UseInitiateRemoveBLSPublicKeyReturn {
  const defaultArgs = useMemo(() => [BigInt(contractId ?? 0)] as [bigint], [contractId]);

  const { simulateAndWriteContract, ...rest } = useContractWriteQuery({
    contract: vestingContractAddress ? 'TokenVestingStaking' : 'ServiceNodeRewards',
    functionName: 'initiateExitBLSPublicKey',
    args: defaultArgs,
    addressOverride: vestingContractAddress,
  });

  return {
    initiateRemoveBLSPublicKey: simulateAndWriteContract,
    ...rest,
  };
}

export type UseRemoveBLSPublicKeyWithSignatureReturn = ContractWriteQueryProps & {
  removeBLSPublicKeyWithSignature: () => void;
};

export function useRemoveBLSPublicKeyWithSignature({
  blsPubKey,
  timestamp,
  blsSignature,
  excludedSigners = [],
}: {
  blsPubKey: string;
  timestamp: number;
  blsSignature: string;
  excludedSigners?: Array<bigint>;
}): UseRemoveBLSPublicKeyWithSignatureReturn {
  const defaultArgs = useMemo(() => {
    const encodedBlsPubKey = encodeBlsPubKey(blsPubKey);
    const encodedBlsSignature = encodeBlsSignature(blsSignature);
    const encodedTimestamp = BigInt(timestamp);

    return [encodedBlsPubKey, encodedTimestamp, encodedBlsSignature, excludedSigners] as const;
  }, [blsPubKey, timestamp, blsSignature, excludedSigners]);

  const { simulateAndWriteContract, ...rest } = useContractWriteQuery({
    contract: 'ServiceNodeRewards',
    functionName: 'exitBLSPublicKeyWithSignature',
    args: defaultArgs,
  });

  return {
    removeBLSPublicKeyWithSignature: simulateAndWriteContract,
    ...rest,
  };
}

export function useGetRecipients({ address }: { address: Address }) {
  const { data: recipients, ...rest } = useContractReadQuery({
    contract: 'ServiceNodeRewards',
    functionName: 'recipients',
    args: [address],
    enabled: !!address,
  });

  const [rewards, claimed] = useMemo(() => {
    if (!recipients || recipients.length !== 2) return [undefined, undefined];
    return recipients;
  }, [recipients]);

  return {
    rewards,
    claimed,
    ...rest,
  };
}

export function useClaimThreshold({ enabled }: { enabled?: boolean }) {
  const { data: claimThreshold, ...rest } = useContractReadQuery({
    contract: 'ServiceNodeRewards',
    functionName: 'claimThreshold',
    enabled,
  });

  return {
    claimThreshold,
    ...rest,
  };
}


export function useClaimCycle({ enabled }: { enabled?: boolean }) {
  const { data: claimCycle, ...rest } = useContractReadQuery({
    contract: 'ServiceNodeRewards',
    functionName: 'claimCycle',
    enabled,
  });

  return {
    claimCycle,
    ...rest,
  };
}

export function useCurrentClaimTotal({ enabled }: { enabled?: boolean }) {
  const { data: currentClaimTotal, ...rest } = useContractReadQuery({
    contract: 'ServiceNodeRewards',
    functionName: 'currentClaimTotal',
    enabled,
  });

  return {
    currentClaimTotal,
    ...rest,
  };
}

export function useCurrentClaimCycle({ enabled }: { enabled?: boolean }) {
  const { data: currentClaimCycle, ...rest } = useContractReadQuery({
    contract: 'ServiceNodeRewards',
    functionName: 'currentClaimCycle',
    enabled,
  });

  return {
    currentClaimCycle,
    ...rest,
  };
}

export function useClaimCycleDetails({enabled}: {enabled?: boolean}) {
  const claimThresholdHook = useClaimThreshold({enabled});
  const claimCycleHook = useClaimCycle({enabled});
  const currentClaimTotalHook = useCurrentClaimTotal({enabled});

  const status =mergeContractReadStatuses(mergeContractReadStatuses(
    claimThresholdHook.status,
    claimCycleHook.status),
    currentClaimTotalHook.status,
  )

  const refetch = () => {
    claimThresholdHook.refetch();
    claimCycleHook.refetch();
    currentClaimTotalHook.refetch();
  }

  return {
    claimThreshold: claimThresholdHook.claimThreshold,
    claimCycle: claimCycleHook.claimCycle,
    currentClaimTotal: currentClaimTotalHook.currentClaimTotal,
    refetch,
    status,
    enabled
  }
}