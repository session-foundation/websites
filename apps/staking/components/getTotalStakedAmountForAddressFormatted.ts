import { getTotalStakedAmountForAddress } from '@/components/getTotalStakedAmountForAddress';
import { SENT_DECIMALS } from '@session/contracts';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import type {
  ContributionContractContributor,
  StakeContributor,
} from '@session/staking-api-js/schema';
import type { EthereumAddress } from '@session/util-crypto/keys';

export const getTotalStakedAmountForAddressFormatted = (
  contributors: Array<StakeContributor | ContributionContractContributor>,
  address?: EthereumAddress
): string => {
  return formatSENTBigInt(
    address ? getTotalStakedAmountForAddress(contributors, address) : 0n,
    SENT_DECIMALS
  );
};
