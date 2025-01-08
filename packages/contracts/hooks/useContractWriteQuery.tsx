import {
  type Abi,
  type Address,
  type ContractFunctionArgs,
  type ContractFunctionName,
  type SimulateContractErrorType,
  type TransactionExecutionErrorType,
} from 'viem';
import type { WriteContractErrorType } from 'wagmi/actions';
import { addresses, type ContractName, isValidChainId } from '../constants';
import { ContractAbis, Contracts } from '../abis';
import { useEffect, useMemo, useState } from 'react';
import { useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useEstimateContractFee } from './useEstimateContractFee';
import { useWallet } from '@session/wallet/hooks/useWallet';

export type GenericContractStatus = 'error' | 'pending' | 'success';

export type SimulateContractStatus = GenericContractStatus;
export type TransactionContractStatus = GenericContractStatus;
export type WriteContractStatus = GenericContractStatus | 'idle';

export type WriteContractFunction<Args> = (args?: Args) => void;

export type ContractWriteQueryProps = {
  transactionData: unknown;
  /** Execute getting the fee estimation for the contract write */
  estimateContractWriteFee: () => void;
  /** Re-fetch the gas price and units of gas needed to write the contract */
  refetchContractWriteFeeEstimate: () => void;
  /** Reset the contract write query */
  resetContract: () => void;
  /** Estimate gas the amount of gas to make the contract write */
  gasAmountEstimate: bigint | null;
  /** The current price of gas */
  gasPrice: bigint | null;
  /** The estimated fee to write to the contract */
  fee: bigint | null;
  /** Status of the contract simulation */
  simulateStatus: SimulateContractStatus;
  /** Status of the contract write */
  writeStatus: WriteContractStatus;
  /** Status of the contract transaction */
  transactionStatus: TransactionContractStatus;
  /** Status of the whole contract call */
  contractCallStatus: WriteContractStatus;
  /** Contract simulation error */
  simulateError: Error | SimulateContractErrorType | null;
  /** Contract write error */
  writeError: Error | WriteContractErrorType | null;
  /** Contract transaction error */
  transactionError: Error | TransactionExecutionErrorType | null;
  /** Estimate fee status */
  estimateFeeStatus: WriteContractStatus;
  /** Estimate fee error */
  estimateFeeError: Error | null;
  /** If the simulation is enabled */
  simulateEnabled: boolean;
};

export type UseContractWrite<Args> = ContractWriteQueryProps & {
  /** Simulate the contract write then write to the contract if the simulation is successful */
  simulateAndWriteContract: WriteContractFunction<Args>;
  writeContractWithoutSimulating: WriteContractFunction<Args>;
};

export function useContractWriteQuery<
  T extends ContractName,
  C extends ContractAbis[T],
  FName extends ContractFunctionName<C, 'nonpayable' | 'payable'>,
  Args extends ContractFunctionArgs<C, 'nonpayable' | 'payable', FName>,
>({
  contract,
  functionName,
  defaultArgs,
  addressOverride,
}: {
  contract: T;
  defaultArgs?: Args;
  functionName: FName;
  addressOverride?: Address | null;
}): UseContractWrite<Args> {
  const { config, address: executorAddress, chainId } = useWallet();
  const [estimateGasEnabled, setEstimateGasEnabled] = useState<boolean>(false);
  const [simulateEnabled, setSimulateEnabled] = useState<boolean>(false);
  const [contractArgs, setContractArgs] = useState<Args | undefined>(defaultArgs);
  const [simulateStatusOverride, setSimulateStatusOverride] =
    useState<GenericContractStatus | null>(null);

  const {
    data: hash,
    error: writeError,
    status: writeStatus,
    writeContract,
    reset,
  } = useWriteContract({ config });

  const {
    error: transactionError,
    status: transactionStatus,
    data: transactionData,
  } = useWaitForTransactionReceipt({
    config,
    hash,
  });

  const abi = useMemo(() => Contracts[contract] as Abi, [contract]);
  const contractAddress = useMemo(
    () => (isValidChainId(chainId) ? addresses[contract][chainId] : undefined),
    [contract, chainId]
  );

  const address = addressOverride ?? contractAddress;

  const {
    data,
    status: simulateStatusRaw,
    error: simulateError,
    refetch: refetchRaw,
  } = useSimulateContract({
    address,
    abi,
    functionName,
    args: contractArgs as ContractFunctionArgs,
    chainId,
    config,
    query: {
      enabled: simulateEnabled,
      refetchOnWindowFocus: false,
    },
  });

  const refetchSimulate = async () => {
    if (simulateEnabled) {
      setSimulateStatusOverride('pending');
      await refetchRaw();
      setSimulateStatusOverride(null);
    }
  };

  const simulateStatus = useMemo(
    () => simulateStatusOverride ?? simulateStatusRaw,
    [simulateStatusOverride, simulateStatusRaw]
  );

  const {
    estimateGasAmount,
    gasAmountEstimate,
    getGasPrice,
    gasPrice,
    fee,
    status: estimateFeeStatus,
    error: estimateFeeError,
  } = useEstimateContractFee({
    contract,
    functionName,
    executorAddress,
  });

  const estimateContractWriteFee = () => setEstimateGasEnabled(true);

  const refetchContractWriteFeeEstimate = () => {
    void getGasPrice();
    void estimateGasAmount(contractArgs);
  };

  const simulateAndWriteContract: WriteContractFunction<Args> = (args) => {
    if (args) setContractArgs(args);

    setSimulateEnabled(true);

    void refetchSimulate();
  };

  const writeContractWithoutSimulating: WriteContractFunction<Args> = (args) => {
    if (args) setContractArgs(args);

    if (!address) throw new Error('Contract address is not defined');

    writeContract({
      address,
      abi,
      functionName,
      args: contractArgs as ContractFunctionArgs,
      chainId,
    });
  };

  const resetContract = () => {
    setSimulateEnabled(false);
    reset();
  };

  const contractCallStatus = useMemo(() => {
    if (!simulateEnabled) return 'idle';
    if (simulateStatus === 'error' || writeStatus === 'error' || transactionStatus === 'error') {
      return 'error';
    } else if (
      simulateStatus === 'success' &&
      writeStatus === 'success' &&
      transactionStatus === 'success'
    ) {
      return 'success';
    }
    return 'pending';
  }, [simulateEnabled, simulateStatus, writeStatus, transactionStatus]);

  useEffect(() => {
    if (simulateStatus === 'success' && data?.request) {
      writeContract(data.request);
    }
  }, [simulateStatus, data?.request]);

  useEffect(() => {
    if (estimateGasEnabled) {
      void refetchContractWriteFeeEstimate();
    }
  }, [estimateGasEnabled]);

  useEffect(() => setContractArgs(defaultArgs), [defaultArgs]);

  return {
    simulateAndWriteContract,
    writeContractWithoutSimulating,
    estimateContractWriteFee,
    refetchContractWriteFeeEstimate,
    resetContract,
    transactionData,
    fee,
    gasAmountEstimate,
    gasPrice,
    simulateStatus,
    writeStatus,
    transactionStatus,
    contractCallStatus,
    simulateError,
    writeError,
    transactionError,
    estimateFeeStatus,
    estimateFeeError,
    simulateEnabled,
  };
}
