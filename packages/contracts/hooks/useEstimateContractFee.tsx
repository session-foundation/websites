import {
  type Abi,
  type Address,
  type Chain,
  type ContractFunctionArgs,
  type ContractFunctionName,
  createPublicClient,
  http,
} from 'viem';
import { useMemo, useState } from 'react';
import { addresses, type ContractName, isValidChainId } from '../constants';
import { ContractAbis, Contracts } from '../abis';
import type { WriteContractFunction, WriteContractStatus } from './useContractWriteQuery';
import { useWallet } from '@session/wallet/hooks/useWallet';

const initPublicClient = (chain: Chain) =>
  createPublicClient({
    chain,
    transport: http(),
  });

type UseEstimateContractFeeProps = {
  executorAddress?: Address;
};

export const useEstimateContractFee = <
  T extends ContractName,
  C extends ContractAbis[T],
  FName extends ContractFunctionName<C, 'nonpayable' | 'payable'>,
  Args extends ContractFunctionArgs<C, 'nonpayable' | 'payable', FName>,
>({
  contract,
  functionName,
  executorAddress,
}: {
  contract: T;
  functionName: FName;
} & UseEstimateContractFeeProps) => {
  const { chain } = useWallet();
  const [gasAmountEstimate, setGasAmountEstimate] = useState<bigint | null>(null);
  const [gasPrice, setGasPrice] = useState<bigint | null>(null);
  const [executed, setExecuted] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const publicClient = useMemo(() => (chain ? initPublicClient(chain) : null), [chain]);

  const address = useMemo(
    () => (chain && isValidChainId(chain.id) ? addresses[contract][chain.id] : undefined),
    [contract, chain]
  );

  const abi = useMemo(() => Contracts[contract] as Abi, [contract]);

  const getGasPrice = async () => {
    if (!publicClient) {
      throw new Error(`Public client is not defined`);
    }
    const gasPrice = await publicClient.getGasPrice();
    setGasPrice(gasPrice);
  };

  const estimateGasAmount: WriteContractFunction<Args> = async (args) => {
    setExecuted(true);
    try {
      if (!address) {
        throw new Error(`Address for contract ${contract} is not defined on chain ${chain?.id}`);
      }
      if (!publicClient) {
        throw new Error(`Public client is not defined`);
      }

      const gas = await publicClient.estimateContractGas({
        address,
        abi,
        functionName,
        account: executorAddress,
        ...(args ? { args: args as ContractFunctionArgs } : undefined),
      });
      setGasAmountEstimate(gas);
    } catch (e) {
      if (e instanceof Error) {
        setError(e);
      }
    }
  };

  const fee = useMemo(
    () => (gasAmountEstimate && gasPrice ? gasAmountEstimate * gasPrice : null),
    [gasAmountEstimate, gasPrice]
  );

  const status: WriteContractStatus = useMemo(() => {
    if (error) return 'error';
    if (gasAmountEstimate !== null) return 'success';
    return executed ? 'pending' : 'idle';
  }, [error, gasAmountEstimate, executed]);

  return { fee, estimateGasAmount, getGasPrice, gasAmountEstimate, gasPrice, status, error };
};
