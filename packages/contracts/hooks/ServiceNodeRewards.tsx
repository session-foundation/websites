'use client';

import type { ReadContractData } from 'wagmi/query';
import { ServiceNodeRewardsAbi } from '../abis';
import { type ContractReadQueryProps, useContractReadQuery } from './useContractReadQuery';
import { useMemo } from 'react';
import { type ContractWriteQueryProps, useContractWriteQuery } from './useContractWriteQuery';
import { useChain } from './useChain';
import type { Address } from 'viem';
import {
  encodeBlsPubKey,
  encodeBlsSignature,
  encodeED25519PubKey,
  encodeED25519Signature,
} from '../util';

export type ClaimRewardsQuery = ContractWriteQueryProps & {
  /** Claim rewards */
  claimRewards: () => void;
};

export function useClaimRewardsQuery(): ClaimRewardsQuery {
  const chain = useChain();
  const { simulateAndWriteContract, ...rest } = useContractWriteQuery({
    contract: 'ServiceNodeRewards',
    functionName: 'claimRewards',
    chain,
  });

  return {
    claimRewards: simulateAndWriteContract,
    ...rest,
  };
}

export type UpdateRewardsBalanceQuery = ContractWriteQueryProps & {
  /** Update rewards balance */
  updateRewardsBalance: () => void;
};

export type UseUpdateRewardsBalanceQueryParams = {
  address?: Address;
  rewards?: bigint;
  blsSignature?: string;
  excludedSigners?: Array<bigint>;
};

export function useUpdateRewardsBalanceQuery({
  address,
  rewards,
  blsSignature,
  excludedSigners,
}: UseUpdateRewardsBalanceQueryParams): UpdateRewardsBalanceQuery {
  const chain = useChain();

  const defaultArgs = useMemo(() => {
    const encodedBlsSignature = blsSignature ? encodeBlsSignature(blsSignature) : null;

    return [address, rewards, encodedBlsSignature, excludedSigners] as const;
  }, [address, rewards, blsSignature, excludedSigners]);

  const { simulateAndWriteContract, ...rest } = useContractWriteQuery({
    contract: 'ServiceNodeRewards',
    functionName: 'updateRewardsBalance',
    chain,
    // TODO: update the types to better reflect optional args as default
    // @ts-expect-error -- This is fine as the args change once the query is ready to execute.
    defaultArgs,
  });

  return {
    updateRewardsBalance: simulateAndWriteContract,
    ...rest,
  };
}

export type TotalNodesQuery = ContractReadQueryProps & {
  /** The total number of nodes */
  totalNodes: ReadContractData<typeof ServiceNodeRewardsAbi, 'totalNodes', []>;
};

export function useTotalNodesQuery(): TotalNodesQuery {
  const chain = useChain();
  const { data: totalNodes, ...rest } = useContractReadQuery({
    contract: 'ServiceNodeRewards',
    functionName: 'totalNodes',
    chain,
  });

  return {
    totalNodes,
    ...rest,
  };
}

export type UseAddBLSPubKeyReturn = ContractWriteQueryProps & {
  addBLSPubKey: () => void;
};

export function useAddBLSPubKey({
  blsPubKey,
  blsSignature,
  nodePubKey,
  userSignature,
  fee = 0,
}: {
  blsPubKey: string;
  blsSignature: string;
  nodePubKey: string;
  userSignature: string;
  fee?: number;
}): UseAddBLSPubKeyReturn {
  const chain = useChain();
  const defaultArgs = useMemo(() => {
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

    return [encodedBlsPubKey, encodedBlsSignature, encodedNodeParams, []] as const;
  }, [blsPubKey, blsSignature, nodePubKey, userSignature]);

  const { simulateAndWriteContract, ...rest } = useContractWriteQuery({
    contract: 'ServiceNodeRewards',
    functionName: 'addBLSPublicKey',
    chain,
    defaultArgs,
  });

  return {
    addBLSPubKey: simulateAndWriteContract,
    ...rest,
  };
}

export type UseInitiateRemoveBLSPublicKeyReturn = ContractWriteQueryProps & {
  initiateRemoveBLSPublicKey: () => void;
};

export function useInitiateRemoveBLSPublicKey({
  contractId,
}: {
  contractId: number;
}): UseInitiateRemoveBLSPublicKeyReturn {
  const chain = useChain();

  const defaultArgs = useMemo(() => [BigInt(contractId ?? 0)] as [bigint], [contractId]);

  const { simulateAndWriteContract, ...rest } = useContractWriteQuery({
    contract: 'ServiceNodeRewards',
    functionName: 'initiateExitBLSPublicKey',
    chain,
    defaultArgs,
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
  const chain = useChain();
  const defaultArgs = useMemo(() => {
    const encodedBlsPubKey = encodeBlsPubKey(blsPubKey);
    const encodedBlsSignature = encodeBlsSignature(blsSignature);
    const encodedTimestamp = BigInt(timestamp);

    return [encodedBlsPubKey, encodedTimestamp, encodedBlsSignature, excludedSigners] as const;
  }, [blsPubKey, timestamp, blsSignature, excludedSigners]);

  const { simulateAndWriteContract, ...rest } = useContractWriteQuery({
    contract: 'ServiceNodeRewards',
    functionName: 'exitBLSPublicKeyWithSignature',
    chain,
    defaultArgs,
  });

  return {
    removeBLSPublicKeyWithSignature: simulateAndWriteContract,
    ...rest,
  };
}
