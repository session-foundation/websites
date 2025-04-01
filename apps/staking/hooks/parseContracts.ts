import { ARBITRUM_EVENT, CONTRIBUTION_CONTRACT_STATUS } from '@session/staking-api-js/enums';
import type { ContributionContract } from '@session/staking-api-js/schema';
import { areHexesEqual } from '@session/util-crypto/string';
import type { Address } from 'viem';
import { getTotalStakedAmountForAddress } from '../components/getTotalStakedAmountForAddress';
import logger from '../lib/logger';
import { sortEvents } from './parseEvents';
import { sortingReservedContractsDesc, sortingTotalStakedDesc } from './parseStakes';

const contractStateSortOrderIfOperator = {
  [CONTRIBUTION_CONTRACT_STATUS.WaitForFinalized]: 1,
  [CONTRIBUTION_CONTRACT_STATUS.WaitForOperatorContrib]: 2,
  [CONTRIBUTION_CONTRACT_STATUS.OpenForPublicContrib]: 3,
  [CONTRIBUTION_CONTRACT_STATUS.Finalized]: 4,
};

/**
 * If the connected wallet is the contract operator, then the contracts are sorted by {@link contractStateSortOrderIfOperator}
 *
 * If the state is the same OR the connected wallet isn't the contract operator, then the contract are sorted by the total staked amount descending
 * then by the operator fee ascending
 */
export function sortContracts(a: ContributionContract, b: ContributionContract, address?: Address) {
  const operatorA = areHexesEqual(a.operator_address, address);
  const operatorB = areHexesEqual(b.operator_address, address);

  const priorityA = operatorA
    ? (contractStateSortOrderIfOperator[a.status] ?? Number.POSITIVE_INFINITY)
    : Number.POSITIVE_INFINITY;
  const priorityB = operatorB
    ? (contractStateSortOrderIfOperator[b.status] ?? Number.POSITIVE_INFINITY)
    : Number.POSITIVE_INFINITY;

  if (priorityA !== priorityB) {
    // Priority ascending
    return priorityA - priorityB;
  }

  const reservedSort = sortingReservedContractsDesc(a, b, address);

  if (reservedSort !== 0) {
    return reservedSort;
  }

  const stakeSort = sortingTotalStakedDesc(a, b, address);
  if (stakeSort !== 0) {
    return stakeSort;
  }

  // fee ascending
  return (a.fee ?? 0) - (b.fee ?? 0);
}

export type ParseStakesParams = {
  contracts: Array<ContributionContract>;
  address?: Address;
  blockHeight: number;
  addedBlsKeys: Record<string, number>;
  nodeMinLifespanArbBlocks: number;
  runningStakesBlsKeysSet: Set<string>;
};

/**
 * Sorts contracts by deploy block descending.
 * @param contracts - The contracts to sort.
 * @returns The sorted contracts.
 */
export function sortContractByDeployBlockDesc(contracts: Array<ContributionContract>) {
  const deployBlockMap = new Map<Address, number>();
  const _contracts: Array<ContributionContract> = [];

  for (const contract of contracts) {
    contract.events.sort(sortEvents);
    const deployEventBlock = contract.events.find(
      (event) => event.name === ARBITRUM_EVENT.NewServiceNodeContributionContract
    )?.block;
    if (deployEventBlock) {
      deployBlockMap.set(contract.address, deployEventBlock);
    }
    _contracts.push(contract);
  }

  /**
   * Sort contracts by the block number they were deployed at
   * The nullish coalescing operator will never get called, but this is required to satisfy the transpiler
   */
  _contracts.sort(
    (a, b) => (deployBlockMap.get(b.address) ?? 0) - (deployBlockMap.get(a.address) ?? 0)
  );

  return _contracts;
}

/**
 * Parses the stakes and contracts.
 * @param contracts - The contracts to parse.
 * @param address - The address to filter by.
 * @param addedBlsKeys - The added BLS keys.
 * @param runningStakesBlsKeysSet - The running stakes BLS keys set.
 * @param nodeMinLifespanArbBlocks - The node min lifespan in Arbitrum blocks.
 * @returns The parsed stakes and contracts.
 */
export function parseContracts({
  contracts,
  address,
  addedBlsKeys,
  runningStakesBlsKeysSet,
  nodeMinLifespanArbBlocks,
}: ParseStakesParams) {
  const networkBlsKeys = new Set(Object.keys(addedBlsKeys));
  const networkContractIds = new Set(Object.values(addedBlsKeys));

  const _contracts = sortContractByDeployBlockDesc(contracts);

  const added = new Set();
  const hiddenContractsWithStakes: Array<ContributionContract> = [];
  const visibleContracts: Array<ContributionContract> = [];
  const joiningContracts: Array<ContributionContract> = [];

  /**
   * The contract array is pre-sorted in descending order by the block number it was deployed at.
   * The "latest" of each contract is added to the visible contracts array, any future duplicate
   * contracts are hidden unless the wallet has a stake for that contract.
   */
  for (const contract of _contracts) {
    const { pubkey_bls, status, events, contributors } = contract;

    if (
      networkBlsKeys.has(pubkey_bls) ||
      added.has(pubkey_bls) ||
      runningStakesBlsKeysSet.has(pubkey_bls)
    ) {
      if (
        status !== CONTRIBUTION_CONTRACT_STATUS.Finalized &&
        address &&
        getTotalStakedAmountForAddress(contributors, address) > 0n
      ) {
        logger.debug(
          `Contract has duplicate pubkey, but has stakes, showing with warning: ${pubkey_bls}`
        );
        hiddenContractsWithStakes.push(contract);
      } else {
        logger.debug(`Contract has duplicate pubkey, hiding: ${pubkey_bls}`);
      }
      continue;
    }

    if (status === CONTRIBUTION_CONTRACT_STATUS.Finalized) {
      const lastFinalized = events.filter((event) => event.name === 'Finalized')[0];
      if (!lastFinalized) {
        logger.warn(`Contract is finalized, but no Finalized event, showing: ${pubkey_bls}`);
      } else if (lastFinalized.block < nodeMinLifespanArbBlocks) {
        logger.debug(
          `Contract was finalized at block ${lastFinalized.block}, this is less than the lifespan limit (${nodeMinLifespanArbBlocks}), showing: ${pubkey_bls}`
        );
        joiningContracts.push(contract);
        added.add(pubkey_bls);
        continue;
      } else {
        logger.debug(
          `Contract was finalized at block ${lastFinalized.block}, this is greater than the lifespan limit (${nodeMinLifespanArbBlocks}), hiding: ${pubkey_bls}`
        );
        continue;
      }
    }

    visibleContracts.push(contract);
    added.add(pubkey_bls);
  }
  hiddenContractsWithStakes.sort((a, b) => sortContracts(a, b, address));
  visibleContracts.sort((a, b) => sortContracts(a, b, address));
  joiningContracts.sort((a, b) => sortContracts(a, b, address));

  return {
    visibleContracts,
    joiningContracts,
    hiddenContractsWithStakes,
    networkBlsKeys,
    networkContractIds,
  };
}
