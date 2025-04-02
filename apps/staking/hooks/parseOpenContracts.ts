import { sortContractByDeployBlockDesc, sortContracts } from '@/hooks/parseContracts';
import logger from '@/lib/logger';
import { CONTRIBUTION_CONTRACT_STATUS } from '@session/staking-api-js/enums';
import type { ContributionContract } from '@session/staking-api-js/schema';
import type { Address } from 'viem';

/**
 * Parses the open contracts.
 * @param contracts - The contracts to parse.
 * @param address - The address to filter by.
 * @param networkBlsKeys - The network BLS keys.
 * @param addedBlsKeysPublic - The added BLS keys public.
 * @returns The parsed open contracts.
 */
export function parseOpenContracts(
  contracts: Array<ContributionContract>,
  address?: Address,
  networkBlsKeys?: Set<string> | null,
  addedBlsKeysPublic?: Set<string> | null
) {
  if (!addedBlsKeysPublic && !networkBlsKeys) return [];

  const _contracts = sortContractByDeployBlockDesc(contracts);

  const added = new Set();

  if (!addedBlsKeysPublic && !networkBlsKeys) return [];

  const contractsFiltered: Array<ContributionContract> = [];
  for (const contract of _contracts) {
    if (added.has(contract.pubkey_bls)) {
      logger.debug(
        `Open contract has duplicate pubkey, already added, hiding: ${contract.pubkey_bls}`
      );
      continue;
    }

    if (addedBlsKeysPublic?.has(contract.pubkey_bls)) {
      logger.debug(
        `Open contract has duplicate pubkey, in addedBlsKeysPublic, hiding: ${contract.pubkey_bls}`
      );
      continue;
    }

    if (networkBlsKeys?.has(contract.pubkey_bls)) {
      logger.debug(
        `Open contract has duplicate pubkey, in networkBlsKeys, hiding: ${contract.pubkey_bls}`
      );
      continue;
    }

    if (contract.status === CONTRIBUTION_CONTRACT_STATUS.OpenForPublicContrib) {
      logger.debug(`Open contract is visible: ${contract.pubkey_bls}`);
      contractsFiltered.push(contract);
      added.add(contract.pubkey_bls);
    }
    logger.debug(`Open contract is hidden: ${contract.pubkey_bls}`);
  }

  if (address) {
    contractsFiltered.sort((a, b) => sortContracts(a, b, address));
  }

  return contractsFiltered;
}
