import { SubmitRemoveFunds } from '@/app/stake/[address]/SubmitRemoveFunds';
import { SubmitRemoveFundsVesting } from '@/app/stake/[address]/SubmitRemoveFundsVesting';
import { WalletInteractionButtonWithLocales } from '@/components/WalletInteractionButtonWithLocales';
import { WizardSectionDescription } from '@/components/Wizard';
import useRelativeTime from '@/hooks/useRelativeTime';
import {
  BLOCK_TIME_MS,
  SESSION_NODE_SMALL_CONTRIBUTOR_AMOUNT,
  SESSION_NODE_TIME,
  SESSION_NODE_TIME_STATIC,
} from '@/lib/constants';
import { NEXT_PUBLIC_TESTNET } from '@/lib/env';
import { formatLocalizedTimeFromSeconds } from '@/lib/locale-client';
import logger from '@/lib/logger';
import { useUser } from '@/providers/user-provider';
import { useActiveVestingContract } from '@/providers/vesting-provider';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { ARBITRUM_EVENT } from '@session/staking-api-js/enums';
import type { ContributionContract } from '@session/staking-api-js/schema';
import { Tooltip } from '@session/ui/ui/tooltip';
import { type EthereumAddress, isEthereumAddress } from '@session/util-crypto/keys';
import { areEthereumAddressesEqual } from '@session/util-crypto/string';
import { safeTrySync } from '@session/util-js/try';
import { useBlockNumber } from '@session/wallet/hooks/useBlockNumber';
import { useTranslations } from 'next-intl';
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import { arbitrum, arbitrumSepolia } from 'viem/chains';

const useWithdrawableStake = ({
  contract,
  address,
}: { contract: ContributionContract; address?: EthereumAddress }) => {
  const { data: blockNumber } = useBlockNumber({
    chainId: NEXT_PUBLIC_TESTNET ? arbitrumSepolia.id : arbitrum.id,
  });
  const withdrawableBlock = useMemo(() => {
    const contributionEvent = contract.events.find(
      (e) =>
        e.name === ARBITRUM_EVENT.NewContribution &&
        e.args &&
        typeof e.args === 'object' &&
        'contributor' in e.args &&
        typeof e.args.contributor === 'string' &&
        isEthereumAddress(e.args.contributor) &&
        areEthereumAddressesEqual(e.args.contributor, address)
    );

    if (!contributionEvent) {
      logger.warn(`No contribution event found for ${address}`);
      return 0;
    }

    return (
      contributionEvent.block +
      SESSION_NODE_TIME_STATIC.NON_FINALIZED_TIME_TO_REMOVE_STAKE_SECONDS *
        (1000 / BLOCK_TIME_MS.ARBITRUM)
    );
  }, [contract, address]);

  const isTooSoonToWithdraw = blockNumber !== undefined && blockNumber < withdrawableBlock;

  const withdrawDate = useMemo(() => {
    if (blockNumber == null) return null;
    const msUntilWithdraw = (withdrawableBlock - Number(blockNumber)) * BLOCK_TIME_MS.ARBITRUM;
    return new Date(Date.now() + msUntilWithdraw);
  }, [withdrawableBlock, blockNumber]);

  const withdrawRelativeTime = useRelativeTime(withdrawDate, { addSuffix: true });
  const withdrawRelativeTimeNoSuffix = useRelativeTime(withdrawDate);

  return {
    isTooSoonToWithdraw,
    withdrawRelativeTime,
    withdrawRelativeTimeNoSuffix,
  };
};

export function StakerRemoveStake({
  contract,
  setIsSubmitting,
  refetch,
}: {
  contract: ContributionContract;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  refetch: () => void;
}) {
  const dictionary = useTranslations('actionModules.staking.manage');
  const [isRemoveStake, setIsRemoveStake] = useState(false);

  const vestingContract = useActiveVestingContract();
  const { activeAddress } = useUser();

  const dictionaryInfoNotice = useTranslations('infoNotice');

  const { withdrawRelativeTime, withdrawRelativeTimeNoSuffix, isTooSoonToWithdraw } =
    useWithdrawableStake({ contract, address: activeAddress });

  const contributor = useMemo(
    () =>
      contract.contributors.find((contributor) =>
        areEthereumAddressesEqual(contributor.address, activeAddress)
      ),
    [contract.contributors, activeAddress]
  );

  const contributorStakeAmount = useMemo(() => {
    if (!contributor || !contributor.amount) return 0n;

    const [err, amount] = safeTrySync(() => BigInt(contributor.amount));
    if (err) return 0n;

    return amount;
  }, [contributor]);

  const isSmallContributor = contributorStakeAmount < SESSION_NODE_SMALL_CONTRIBUTOR_AMOUNT;

  const handleRemoveStake = () => {
    setIsSubmitting(true);
    setIsRemoveStake(true);
  };

  const removeStakeBaseButton = (
    <WalletInteractionButtonWithLocales
      type="button"
      variant="destructive"
      className="w-full"
      disabled={isTooSoonToWithdraw}
      data-testid={ButtonDataTestId.Stake_Manage_Remove_Stake}
      aria-label={dictionary('buttonRemoveStake.aria')}
      onClick={handleRemoveStake}
    >
      {dictionary('buttonRemoveStake.text')}
    </WalletInteractionButtonWithLocales>
  );

  const removeStakeButton = isTooSoonToWithdraw ? (
    <Tooltip
      tooltipContent={
        <WizardSectionDescription
          description={dictionaryInfoNotice.rich('withdrawContributorTooSoon', {
            relativeTime: withdrawRelativeTime,
            relativeTimeNoSuffix: withdrawRelativeTimeNoSuffix,
            unlockWaitTime: formatLocalizedTimeFromSeconds(
              isSmallContributor
                ? SESSION_NODE_TIME_STATIC.SMALL_CONTRIBUTOR_EXIT_REQUEST_WAIT_TIME_SECONDS
                : SESSION_NODE_TIME().EXIT_REQUEST_TIME_SECONDS
            ),
            linkOut: '',
          })}
          href="https://docs.getsession.org/contribute-to-the-session-network/frequently-asked-questions-faq#unlock-stake-before-registration"
        />
      }
    >
      <div>{removeStakeBaseButton}</div>
    </Tooltip>
  ) : (
    removeStakeBaseButton
  );

  return (
    <>
      {!isRemoveStake ? removeStakeButton : null}
      {isRemoveStake ? (
        vestingContract ? (
          <SubmitRemoveFundsVesting
            setIsSubmitting={setIsSubmitting}
            contractAddress={contract.address}
          />
        ) : (
          <SubmitRemoveFunds
            setIsSubmitting={setIsSubmitting}
            contractAddress={contract.address}
            refetch={refetch}
          />
        )
      ) : null}
    </>
  );
}
