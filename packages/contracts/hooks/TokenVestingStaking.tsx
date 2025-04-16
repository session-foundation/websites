import { useMemo, useState } from 'react';
import type { Address } from 'viem';
import {
  type UseAddBLSPubKeyReturn,
  type UseAddBlsPubKeyParams,
  encodeAddBlsPubKeyArgs,
} from './ServiceNodeRewards';
import { type ContractWriteQueryProps, useContractWriteQuery } from './useContractWriteQuery';
import { useEstimateContractFee } from './useEstimateContractFee';

export type TransferBeneficiary = ContractWriteQueryProps & {
  /** Transfer beneficiary */
  transferBeneficiary: (params: [Address]) => void;
};

export function useTransferBeneficiaryQuery(contractAddress: Address): TransferBeneficiary {
  const { simulateAndWriteContract, ...rest } = useContractWriteQuery({
    contract: 'TokenVestingStaking',
    functionName: 'transferBeneficiary',
    addressOverride: contractAddress,
  });

  return {
    transferBeneficiary: simulateAndWriteContract,
    ...rest,
  };
}

export type UseVestingAddBlsPubKeyParams = Omit<UseAddBlsPubKeyParams, 'contributors'> & {
  rewardsAddress: Address;
  vestingContractAddress: Address;
};

export function useVestingAddBLSPubKey({
  blsPubKey,
  blsSignature,
  nodePubKey,
  userSignature,
  fee = 0,
  rewardsAddress,
  vestingContractAddress,
}: UseVestingAddBlsPubKeyParams): UseAddBLSPubKeyReturn {
  const { encodedBlsPubKey, encodedBlsSignature, encodedNodeParams } = useMemo(() => {
    return encodeAddBlsPubKeyArgs({
      blsPubKey,
      blsSignature,
      nodePubKey,
      userSignature,
      fee,
    });
  }, [blsPubKey, blsSignature, nodePubKey, userSignature, fee]);

  const { simulateAndWriteContract, ...rest } = useContractWriteQuery({
    contract: 'TokenVestingStaking',
    functionName: 'addBLSPublicKey',
    args: [encodedBlsPubKey, encodedBlsSignature, encodedNodeParams, rewardsAddress],
    addressOverride: vestingContractAddress,
  });

  return {
    addBLSPubKey: simulateAndWriteContract,
    ...rest,
  };
}

export function useVestingAddBLSPubKeyFeeEstimate({
  blsPubKey,
  blsSignature,
  nodePubKey,
  userSignature,
  fee = 0,
  rewardsAddress,
  vestingContractAddress,
}: UseVestingAddBlsPubKeyParams) {
  const { encodedBlsPubKey, encodedBlsSignature, encodedNodeParams } = useMemo(() => {
    return encodeAddBlsPubKeyArgs({
      blsPubKey,
      blsSignature,
      nodePubKey,
      userSignature,
      fee,
    });
  }, [blsPubKey, blsSignature, nodePubKey, userSignature, fee]);

  return useEstimateContractFee({
    contract: 'TokenVestingStaking',
    functionName: 'addBLSPublicKey',
    args: [encodedBlsPubKey, encodedBlsSignature, encodedNodeParams, rewardsAddress],
    addressOverride: vestingContractAddress,
  });
}

export type UseVestingReleaseParams = {
  vestingContractAddress: Address;
  tokenAddress: Address;
};

export function useVestingRelease({
  vestingContractAddress,
  tokenAddress,
}: UseVestingReleaseParams) {
  return useContractWriteQuery({
    contract: 'TokenVestingStaking',
    functionName: 'release',
    args: [tokenAddress],
    addressOverride: vestingContractAddress,
  });
}

export type UseContributeFunds = ContractWriteQueryProps & {
  contributeFunds: (contractAddress?: Address) => void;
};

type UseContributeFundsParams = {
  amount: bigint;
  beneficiary: Address;
  contractAddress?: Address;
  vestingContractAddress?: Address;
};

export function useVestingContributeFunds({
  amount,
  beneficiary,
  contractAddress,
  vestingContractAddress,
}: UseContributeFundsParams): UseContributeFunds {
  const [contractAddressOverride, setContractAddressOverride] = useState<Address | null>(null);

  const { simulateAndWriteContract, ...rest } = useContractWriteQuery({
    contract: 'TokenVestingStaking',
    functionName: 'contributeFunds',
    // biome-ignore lint/style/noNonNullAssertion: guaranteed to be defined at execution time
    args: [(contractAddressOverride ?? contractAddress)!, amount, beneficiary],
    addressOverride: vestingContractAddress,
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

export type UseWithdrawContribution = ContractWriteQueryProps & {
  withdrawContribution: (contractAddress?: Address) => void;
};

export type UseWithdrawContributionParams = {
  contractAddress?: Address;
  vestingContractAddress?: Address;
};

export function useVestingWithdrawContribution({
  contractAddress,
  vestingContractAddress,
}: UseWithdrawContributionParams): UseWithdrawContribution {
  const [contractAddressOverride, setContractAddressOverride] = useState<Address | null>(null);

  const { simulateAndWriteContract, ...rest } = useContractWriteQuery({
    contract: 'TokenVestingStaking',
    functionName: 'withdrawContribution',
    // biome-ignore lint/style/noNonNullAssertion: guaranteed to be defined at execution time
    args: [(contractAddressOverride ?? contractAddress)!],
    addressOverride: vestingContractAddress,
  });

  const withdrawContribution = (address?: Address) => {
    if (address) {
      setContractAddressOverride(address);
    } else if (!contractAddress) {
      throw new Error('Contract address is not defined');
    }
    return simulateAndWriteContract();
  };

  return {
    withdrawContribution,
    ...rest,
  };
}
