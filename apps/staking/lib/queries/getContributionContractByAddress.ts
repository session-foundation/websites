import type { SessionStakingClient } from '@session/staking-api-js/client';
import { contributionContractResponseSchema } from '@session/staking-api-js/schema';
import type { Address } from 'viem';

/**
 * Retrieves the contribution contract at a given address, whatever its status.
 * @param client The staking backend client.
 * @param address The contribution contract address.
 * @returns A response whose `contracts` hold the contract; backends without address filtering
 * return every contract.
 */
export const getContributionContractByAddress = async (
  client: SessionStakingClient,
  { address }: { address: Address }
) => {
  const res = await client.getContributionContracts({ address });
  res.data = contributionContractResponseSchema.parse(res.data);
  return res;
};

getContributionContractByAddress.fnName = 'getContributionContractByAddress';
