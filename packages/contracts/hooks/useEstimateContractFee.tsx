import type { ContractFunctionArgs, ContractFunctionName } from 'viem';
import { useMemo } from 'react';
import type { ContractName } from '../constants';
import type { ContractAbis } from '../abis';
import type { WriteContractStatus } from './useContractWriteQuery';
import { useGasPrice } from './useGasPrice';
import { useContractWriteGasQuery } from './useContractWriteGasQuery';

export const useEstimateContractFee = <
  T extends ContractName,
  C extends ContractAbis[T],
  FName extends ContractFunctionName<C, 'nonpayable' | 'payable'>,
  Args extends ContractFunctionArgs<C, 'nonpayable' | 'payable', FName>,
>({
  contract,
  args,
  functionName,
}: {
  contract: T;
  args?: Args;
  functionName: FName;
}) => {
  const { gasPrice, error: gasPriceError, status: gasPriceStatus } = useGasPrice();

  const {
    gasAmount,
    getGasAmount,
    error: gasAmountError,
    status: gasAmountStatus,
  } = useContractWriteGasQuery({
    contract,
    functionName,
    args,
  });

  const fee = useMemo(
    () => (gasAmount && gasPrice ? gasAmount * gasPrice : null),
    [gasAmount, gasPrice]
  );

  const error = gasPriceError || gasAmountError;

  const status: WriteContractStatus = useMemo(() => {
    if (error) return 'error';
    if (gasPriceStatus === 'success' && gasAmountStatus === 'success') return 'success';
    return gasPriceStatus === 'success' ? 'pending' : 'idle';
  }, [error, gasPriceStatus, gasAmountStatus]);

  return { fee, getGasAmount, gasAmount, gasPrice, status, error };
};
