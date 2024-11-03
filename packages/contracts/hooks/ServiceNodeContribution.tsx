import { type ContractWriteQueryProps, useContractWriteQuery } from './useContractWriteQuery';
import { useChain } from './useChain';
import { useMemo, useState } from 'react';
import type { Address } from 'viem';

export type UseCreateOpenNode = ContractWriteQueryProps & {
  contributeFunds: (contractAddress: Address) => void;
};

export function useContributeFunds({
  amount,
  beneficiary,
}: {
  amount: bigint;
  beneficiary: Address;
}): UseCreateOpenNode {
  const [contractAddress, setContractAddress] = useState<Address | null>(null);
  const chain = useChain();
  const defaultArgs = useMemo(() => {
    return [amount, beneficiary] as const;
  }, [amount, beneficiary]);

  const { simulateAndWriteContract, ...rest } = useContractWriteQuery({
    contract: 'ServiceNodeContribution',
    functionName: 'contributeFunds',
    chain,
    defaultArgs: defaultArgs,
    addressOverride: contractAddress,
  });

  const contributeFunds = (contractAddress: Address) => {
    setContractAddress(contractAddress);
    return simulateAndWriteContract();
  };

  return {
    contributeFunds,
    ...rest,
  };
}
