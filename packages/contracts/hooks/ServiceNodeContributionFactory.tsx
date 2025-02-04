import { type ContractWriteQueryProps, useContractWriteQuery } from './useContractWriteQuery';
import { useMemo } from 'react';
import type { Address } from 'viem';
import { encodeAddBlsPubKeyArgs } from './ServiceNodeRewards';
import { useEstimateContractFee } from './useEstimateContractFee';

export type UseCreateOpenNode = ContractWriteQueryProps & {
  createOpenNode: () => void;
};

type UseCreateOpenNodeParams = {
  blsPubKey: string;
  blsSignature: string;
  nodePubKey: string;
  userSignature: string;
  autoStart: boolean;
  reservedContributors: Array<{
    addr: Address;
    amount: bigint;
  }>;
  fee: number;
};

export function useCreateOpenNode({
  blsPubKey,
  blsSignature,
  nodePubKey,
  userSignature,
  autoStart,
  reservedContributors,
  fee,
}: UseCreateOpenNodeParams): UseCreateOpenNode {
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
    contract: 'ServiceNodeContributionFactory',
    functionName: 'deploy',
    args: [
      encodedBlsPubKey,
      encodedBlsSignature,
      encodedNodeParams,
      reservedContributors,
      // The `autoStart` param is `manualFinalize` in the contract, so we invert it here
      !autoStart,
    ],
  });

  return {
    createOpenNode: simulateAndWriteContract,
    ...rest,
  };
}

export function useCreateOpenNodeFeeEstimate({
  blsPubKey,
  blsSignature,
  nodePubKey,
  userSignature,
  fee,
  autoStart,
  reservedContributors,
}: UseCreateOpenNodeParams) {
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
    contract: 'ServiceNodeContributionFactory',
    functionName: 'deploy',
    args: [
      encodedBlsPubKey,
      encodedBlsSignature,
      encodedNodeParams,
      reservedContributors,
      // The `autoStart` param is `manualFinalize` in the contract, so we invert it here
      !autoStart,
    ],
  });
}
