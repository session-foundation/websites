import { useMemo } from 'react';
import type { Address, ContractFunctionArgs, ContractFunctionName } from 'viem';
import type { ContractAbis } from '../abis';
import type { ContractName } from '../constants';
import { useContractWriteGasQuery } from './useContractWriteGasQuery';
import type { WriteContractStatus } from './useContractWriteQuery';
import { useGasPrice } from './useGasPrice';

export const useEstimateContractFee = <
  T extends ContractName,
  C extends ContractAbis[T],
  FName extends ContractFunctionName<C, 'nonpayable' | 'payable'>,
  Args extends ContractFunctionArgs<C, 'nonpayable' | 'payable', FName>,
>({
  contract,
  args,
  functionName,
  addressOverride,
}: {
  contract: T;
  args?: Args;
  functionName: FName;
  addressOverride?: Address | null;
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
    addressOverride,
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
