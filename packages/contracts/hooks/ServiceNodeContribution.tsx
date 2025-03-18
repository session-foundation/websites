import { useMemo, useState } from 'react';
import type { Address } from 'viem';
import { type ContractWriteQueryProps, useContractWriteQuery } from './useContractWriteQuery';
import { useEstimateContractFee } from './useEstimateContractFee';

export type UseContributeFunds = ContractWriteQueryProps & {
  contributeFunds: (contractAddress?: Address) => void;
};

type UseContributeFundsParams = {
  amount: bigint;
  beneficiary: Address;
  contractAddress?: Address;
};

export function useContributeFunds({
  amount,
  beneficiary,
  contractAddress,
}: UseContributeFundsParams): UseContributeFunds {
  const [contractAddressOverride, setContractAddressOverride] = useState<Address | null>(null);
  const defaultArgs = useMemo(() => {
    return [amount, beneficiary] as const;
  }, [amount, beneficiary]);

  const { simulateAndWriteContract, ...rest } = useContractWriteQuery({
    contract: 'ServiceNodeContribution',
    functionName: 'contributeFunds',
    args: defaultArgs,
    addressOverride: contractAddressOverride ?? contractAddress,
  });

  const contributeFunds = (address?: Address) => {
    if (address) {
      setContractAddressOverride(address);
    } else if (!contractAddress) {
      throw new Error('Contract address is not defined');
    }
    return simulateAndWriteContract();
  };

  return {
    contributeFunds,
    ...rest,
  };
}

export function useContributeFundsFeeEstimate({ amount, beneficiary }: UseContributeFundsParams) {
  return useEstimateContractFee({
    contract: 'ServiceNodeContribution',
    functionName: 'contributeFunds',
    args: [amount, beneficiary],
  });
}

export type UseWithdrawContribution = ContractWriteQueryProps & {
  withdrawContribution: (contractAddress?: Address) => void;
};

export type UseWithdrawContributionParams = {
  contractAddress?: Address;
};

export function useWithdrawContribution(
  params?: UseWithdrawContributionParams
): UseWithdrawContribution {
  const [contractAddressOverride, setContractAddressOverride] = useState<Address | null>(null);

  const { simulateAndWriteContract, ...rest } = useContractWriteQuery({
    contract: 'ServiceNodeContribution',
    functionName: 'withdrawContribution',
    addressOverride: contractAddressOverride ?? params?.contractAddress,
  });

  const withdrawContribution = (address?: Address) => {
    if (address) {
      setContractAddressOverride(address);
    } else if (!params?.contractAddress) {
      throw new Error('Contract address is not defined');
    }
    return simulateAndWriteContract();
  };

  return {
    withdrawContribution,
    ...rest,
  };
}

export function useWithdrawContributionFeeEstimate() {
  return useEstimateContractFee({
    contract: 'ServiceNodeContribution',
    functionName: 'withdrawContribution',
  });
}

export type UseFinalizeContract = ContractWriteQueryProps & {
  finalizeContract: (contractAddress?: Address) => void;
};

export type UseFinalizeContractParams = {
  contractAddress?: Address;
};

export function useFinalizeContract(params?: UseFinalizeContractParams) {
  const [contractAddressOverride, setContractAddressOverride] = useState<Address | null>(null);
  const { simulateAndWriteContract, ...rest } = useContractWriteQuery({
    contract: 'ServiceNodeContribution',
    functionName: 'finalize',
    addressOverride: contractAddressOverride ?? params?.contractAddress,
  });

  const finalizeContract = (address?: Address) => {
    if (address) {
      setContractAddressOverride(address);
    } else if (!params?.contractAddress) {
      throw new Error('Contract address is not defined');
    }
    return simulateAndWriteContract();
  };

  return {
    finalizeContract,
    ...rest,
  };
}
