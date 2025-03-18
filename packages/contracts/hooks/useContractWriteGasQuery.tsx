import { useWallet } from '@session/wallet/hooks/useWallet';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { Abi, Address, ContractFunctionArgs, ContractFunctionName } from 'viem';
import { type ContractAbis, Contracts } from '../abis';
import { type ContractName, addresses, isValidChainId } from '../constants';
import type { WriteContractFunction } from './useContractWriteQuery';
import { usePublicWeb3Client } from './usePublicWeb3Client';

export function useContractWriteGasQuery<
  T extends ContractName,
  C extends ContractAbis[T],
  FName extends ContractFunctionName<C, 'nonpayable' | 'payable'>,
  Args extends ContractFunctionArgs<C, 'nonpayable' | 'payable', FName>,
>({
  contract,
  functionName,
  args,
  addressOverride,
}: {
  contract: T;
  args?: Args;
  functionName: FName;
  addressOverride?: Address | null;
}) {
  const { chain, chainId, address: connectedAddress } = useWallet();
  const [overrideContractArgs, setOverrideContractArgs] = useState<Args | undefined>();
  const [customError, setCustomError] = useState<Error | null>(null);

  const contractArgs = overrideContractArgs ?? args;

  const publicClient = usePublicWeb3Client();

  const contractAddress = useMemo(
    () => (isValidChainId(chainId) ? addresses[contract][chainId] : undefined),
    [contract, chainId]
  );

  const address = addressOverride ?? contractAddress;

  const abi = useMemo(() => Contracts[contract] as Abi, [contract]);

  const allContractArgsDefined = useMemo(
    () => Array.isArray(contractArgs) && contractArgs.every((arg) => arg !== undefined),
    [contractArgs]
  );

  const canRun = !!(
    address &&
    functionName &&
    publicClient &&
    chainId &&
    connectedAddress &&
    (contractArgs === undefined || allContractArgsDefined)
  );

  const {
    refetch,
    data,
    error: queryError,
    isError: isQueryError,
    ...rest
  } = useQuery({
    queryKey: [
      'contractWriteGas',
      chainId,
      address,
      functionName,
      connectedAddress,
      allContractArgsDefined,
    ],
    queryFn: canRun
      ? () =>
          publicClient.estimateContractGas({
            address,
            abi,
            functionName,
            account: connectedAddress,
            args: contractArgs as ContractFunctionArgs,
          })
      : skipToken,
  });

  const getGasAmount: WriteContractFunction<Args> = (argsOverride) => {
    setCustomError(null);
    if (argsOverride) setOverrideContractArgs(argsOverride);
    try {
      if (!address) {
        throw new Error(`Address for contract ${contract} is not defined on chain ${chain?.id}`);
      }
      if (!publicClient) {
        throw new Error('Public client is not defined');
      }

      if (!canRun) {
        throw new Error('Cannot run contract gas query');
      }

      return refetch();
    } catch (e) {
      if (e instanceof Error) {
        setCustomError(e);
      }
    }
  };

  const isError = isQueryError || customError !== null;
  const error = customError ?? queryError;

  return {
    getGasAmount,
    gasAmount: data ?? null,
    abi,
    isError,
    error,
    ...rest,
  };
}
