'use client';

import { formatBigIntTokenValue } from '@session/util-crypto/maths';
import { isProduction } from '@session/util-js/env';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useEffect, useMemo, useState } from 'react';
import type { Address, SimulateContractErrorType, TransactionExecutionErrorType } from 'viem';
import type { WriteContractErrorType } from 'wagmi/actions';
import type { ReadContractData } from 'wagmi/query';
import type { SENTAbi } from '../abis';
import { SENT_DECIMALS, SENT_SYMBOL } from '../constants';
import { type ContractReadQueryProps, useContractReadQuery } from './useContractReadQuery';
import {
  type GenericContractStatus,
  type WriteContractStatus,
  useContractWriteQuery,
} from './useContractWriteQuery';
import { useEstimateContractFee } from './useEstimateContractFee';

export const formatSENTBigIntNoRounding = (value?: bigint | null, hideSymbol?: boolean) =>
  formatSENTBigInt(value, SENT_DECIMALS, hideSymbol);

export const formatSENTBigInt = (value?: bigint | null, decimals?: number, hideSymbol?: boolean) =>
  `${value ? formatBigIntTokenValue(value, SENT_DECIMALS, decimals) : 0}${hideSymbol ? '' : ` ${SENT_SYMBOL}`}`;

export const formatSENTNumber = (value?: number | null, decimals?: number, hideSymbol?: boolean) =>
  formatSENTBigInt(value ? BigInt(value) : null, decimals, hideSymbol);

type SENTBalance = ReadContractData<typeof SENTAbi, 'balanceOf', [Address]>;

export type SENTBalanceQuery = ContractReadQueryProps & {
  /** The session token balance */
  balance: SENTBalance;
};

export function useSENTBalanceQuery({ address }: { address?: Address }): SENTBalanceQuery {
  const { data: balance, ...rest } = useContractReadQuery({
    contract: 'Token',
    functionName: 'balanceOf',
    //biome-ignore lint/style/noNonNullAssertion: limitation of the library
    args: [address!],
    enabled: !!address,
  });

  return {
    balance,
    ...rest,
  };
}

type SENTAllowance = ReadContractData<typeof SENTAbi, 'allowance', [Address, Address]>;

export type SENTAllowanceQuery = ContractReadQueryProps & {
  /** The session token allowance for a contract */
  allowance: SENTAllowance;
};

export function useAllowanceQuery({
  contractAddress,
  gcTime,
}: {
  contractAddress?: Address | null;
  gcTime?: number;
}): SENTAllowanceQuery {
  const { address } = useWallet();

  const args = useMemo(
    () => (address && contractAddress ? ([address, contractAddress] as const) : undefined),
    [address, contractAddress]
  );

  const { data: allowance, ...rest } = useContractReadQuery({
    contract: 'Token',
    functionName: 'allowance',
    args,
    enabled: !!args,
    gcTime,
  });

  return {
    allowance,
    ...rest,
  };
}

export type UseProxyApprovalReturn = {
  approve: () => void;
  approveWrite: () => void;
  resetApprove: () => void;
  status: WriteContractStatus;
  readStatus: GenericContractStatus;
  simulateError: SimulateContractErrorType | Error | null;
  writeError: WriteContractErrorType | Error | null;
  transactionError: TransactionExecutionErrorType | Error | null;
  fee: bigint | null;
  gasAmount: bigint | null;
  gasPrice: bigint | null;
};

export function useProxyApproval({
  contractAddress,
  tokenAmount,
  gcTime,
}: {
  contractAddress?: Address | null;
  tokenAmount: bigint;
  gcTime?: number;
}): UseProxyApprovalReturn {
  const [hasEnoughAllowance, setHasEnoughAllowance] = useState<boolean>(false);
  const [allowanceReadStatusOverride, setAllowanceReadStatusOverride] =
    useState<GenericContractStatus | null>(null);

  const { address } = useWallet();
  const {
    allowance,
    status: readStatusRaw,
    refetch: refetchRaw,
  } = useAllowanceQuery({
    contractAddress,
    gcTime,
  });

  const refetchAllowance = async () => {
    if (contractAddress) {
      setAllowanceReadStatusOverride('pending');
      await refetchRaw();
      setAllowanceReadStatusOverride(null);
    }
  };

  const readStatus = useMemo(
    () => allowanceReadStatusOverride ?? readStatusRaw,
    [allowanceReadStatusOverride, readStatusRaw]
  );

  const {
    simulateAndWriteContract,
    resetContract,
    contractCallStatus,
    simulateError,
    writeError,
    transactionError,
    fee,
    gasAmount,
    gasPrice,
  } = useContractWriteQuery({
    contract: 'Token',
    functionName: 'approve',
  });

  const approve = () => {
    if (allowance) {
      void refetchAllowance();
    }
  };

  const resetApprove = () => {
    if (contractAddress) {
      resetContract();
    }
  };

  const approveWrite = () => {
    if (!contractAddress) {
      throw new Error('No contract address for approveWrite');
    }

    if (tokenAmount > BigInt(0) && allowance >= tokenAmount) {
      setHasEnoughAllowance(true);
      if (!isProduction()) {
        console.debug(
          `Allowance for ${address} on contract ${contractAddress} is sufficient: ${allowance}`
        );
      }
      return;
    }

    simulateAndWriteContract([contractAddress, tokenAmount]);
  };

  const status = useMemo(() => {
    if (readStatus === 'success' && hasEnoughAllowance) {
      return 'success';
    }

    if (!hasEnoughAllowance) {
      return contractCallStatus;
    }

    if (readStatus === 'pending') {
      return 'pending';
    }
    return contractCallStatus;
  }, [readStatus, contractCallStatus, hasEnoughAllowance]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only trigger on success or contract change
  useEffect(() => {
    if (readStatus === 'success' && tokenAmount > BigInt(0) && contractAddress) {
      approveWrite();
    }
  }, [readStatus, contractAddress, tokenAmount]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only trigger on address change
  useEffect(() => {
    if (contractAddress && (readStatusRaw === 'success' || readStatusRaw === 'error')) {
      void refetchAllowance();
    }
  }, [contractAddress]);

  return {
    approve,
    approveWrite,
    resetApprove,
    status,
    readStatus,
    simulateError,
    writeError,
    transactionError,
    fee,
    gasAmount,
    gasPrice,
  };
}

export function useProxyApprovalFeeEstimate({
  contractAddress,
  amount,
}: { contractAddress: Address; amount: bigint }) {
  return useEstimateContractFee({
    contract: 'Token',
    functionName: 'approve',
    args: [contractAddress, amount],
  });
}
