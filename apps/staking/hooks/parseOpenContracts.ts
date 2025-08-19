import { sortContractByDeployBlockDesc, sortContracts } from '@/hooks/parseContracts';
import logger from '@/lib/logger';
import { CONTRIBUTION_CONTRACT_STATUS } from '@session/staking-api-js/enums';
import type { ContributionContract } from '@session/staking-api-js/schema';
import type { BLSPublicKey, Ed25519PublicKey, EthereumAddress } from '@session/util-crypto/keys';

/**
 * Parses the open contracts.
 * @param contracts - The contracts to parse.
 * @param address - The address to filter by.
 * @param blsSet - The network BLS keys.
 * @param ed25519Set - The added BLS keys public.
 * @returns The parsed open contracts.
 */
export function parseOpenContracts(
  contracts: Array<ContributionContract>,
  blsSet: Set<BLSPublicKey>,
  ed25519Set: Set<Ed25519PublicKey>,
  address?: EthereumAddress
) {
  const _contracts = sortContractByDeployBlockDesc(contracts);

  const added = new Set();

  const contractsFiltered: Array<ContributionContract> = [];
  for (const contract of _contracts) {
    if (added.has(contract.pubkey_bls)) {
      logger.debug(
        `Open contract has duplicate pubkey, already added, hiding: ${contract.pubkey_bls}`
      );
      continue;
    }

    if (blsSet.has(contract.pubkey_bls)) {
      logger.debug(
        `Open contract has duplicate bls pubkey (${contract.pubkey_bls}), hiding: ${contract.service_node_pubkey}`
      );
      continue;
    }

    if (ed25519Set.has(contract.service_node_pubkey)) {
      logger.debug(
        `Open contract has duplicate ed25519 pubkey, hiding: ${contract.service_node_pubkey}`
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

  return contractsFiltered.sort((a, b) => sortContracts(a, b, address));
}
