import { type ContractWriteQueryProps, useContractWriteQuery } from './useContractWriteQuery';
import { useMemo } from 'react';
import {
  encodeBlsPubKey,
  encodeBlsSignature,
  encodeED25519PubKey,
  encodeED25519Signature,
} from '../util';
import type { Address } from 'viem';

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
  const { pubKey } = encodeED25519PubKey(nodePubKey);

  const defaultArgs = useMemo(() => {
    const encodedBlsPubKey = encodeBlsPubKey(blsPubKey);
    const encodedBlsSignature = encodeBlsSignature(blsSignature);
    const { sigs0, sigs1 } = encodeED25519Signature(userSignature);

    const encodedNodeParams = {
      serviceNodePubkey: pubKey,
      serviceNodeSignature1: sigs0,
      serviceNodeSignature2: sigs1,
      fee,
    };

    return [
      encodedBlsPubKey,
      encodedBlsSignature,
      encodedNodeParams,
      reservedContributors,
      // The `autoStart` param is `manualFinalize` in the contract, so we invert it here
      !autoStart,
    ] as const;
  }, [blsPubKey, blsSignature, pubKey, userSignature, autoStart, fee]);

  const { simulateAndWriteContract, ...rest } = useContractWriteQuery({
    contract: 'ServiceNodeContributionFactory',
    functionName: 'deploy',
    defaultArgs: defaultArgs,
  });

  return {
    createOpenNode: simulateAndWriteContract,
    ...rest,
  };
}
