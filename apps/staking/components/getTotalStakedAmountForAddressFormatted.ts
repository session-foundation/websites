import { getTotalStakedAmountForAddress } from '@/components/getTotalStakedAmountForAddress';
import { SENT_DECIMALS } from '@session/contracts';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import type {
  ContributionContractContributor,
  StakeContributor,
} from '@session/staking-api-js/schema';

export const getTotalStakedAmountForAddressFormatted = (
  contributors: Array<StakeContributor | ContributionContractContributor>,
  address?: string
): string => {
  return formatSENTBigInt(
    address ? getTotalStakedAmountForAddress(contributors, address) : 0n,
    SENT_DECIMALS
  );
};
