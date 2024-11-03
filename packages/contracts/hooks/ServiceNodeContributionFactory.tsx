import { type ContractWriteQueryProps, useContractWriteQuery } from './useContractWriteQuery';
import { useChain } from './useChain';
import { useMemo, useState } from 'react';
import {
  encodeBlsPubKey,
  encodeBlsSignature,
  encodeED25519PubKey,
  encodeED25519Signature,
} from '../util';
import type { Address } from 'viem';
import { useWatchContractEvent } from 'wagmi';
import { addresses } from '../constants';
import { chains } from '../chains';
import { ServiceNodeContributionFactoryAbi } from '../abis';

export type UseCreateOpenNode = ContractWriteQueryProps & {
  createOpenNode: () => void;
  openNodeContractAddress: Address | null;
};

export function useCreateOpenNode({
  blsPubKey,
  blsSignature,
  nodePubKey,
  userSignature,
  autoStart,
  reservedContributors,
  fee,
}: {
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
}): UseCreateOpenNode {
  const chain = useChain();
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
    chain,
    defaultArgs: defaultArgs,
  });

  const { openNodeContractAddress } = useWatchForNewOpenNode({ encodedNodePubKey: pubKey });

  return {
    createOpenNode: simulateAndWriteContract,
    openNodeContractAddress,
    ...rest,
  };
}

export type UseWatchForNewOpenNode = {
  openNodeContractAddress: Address | null;
};

export function useWatchForNewOpenNode({
  encodedNodePubKey,
}: {
  encodedNodePubKey: bigint;
}): UseWatchForNewOpenNode {
  const [openNodeContractAddress, setOpenNodeContractAddress] = useState<Address | null>(null);
  const chain = useChain();

  useWatchContractEvent({
    // enabled: !openNodeContractAddress,
    address: addresses.ServiceNodeContributionFactory[chain],
    eventName: 'NewServiceNodeContributionContract',
    chainId: chains[chain].id,
    abi: ServiceNodeContributionFactoryAbi,
    batch: false,
    onLogs: (logs) => {
      if (
        logs[0]?.args.serviceNodePubkey === encodedNodePubKey &&
        logs[0]?.args.contributorContract
      ) {
        setOpenNodeContractAddress(logs[0].args.contributorContract);
      }
    },
    poll: true,
    pollingInterval: 1000,
  });

  return {
    openNodeContractAddress,
  };
}
