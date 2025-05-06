import { SubmitRemoveFunds } from '@/app/stake/[address]/SubmitRemoveFunds';
import { SubmitRemoveFundsVesting } from '@/app/stake/[address]/SubmitRemoveFundsVesting';
import { WithdrawStakeOperatorNotice } from '@/app/stake/[address]/WithdrawStakeOperatorNotice';
import { useActiveVestingContract } from '@/providers/vesting-provider';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import type { ContributionContract } from '@session/staking-api-js/schema';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';
import { type Dispatch, type SetStateAction, useState } from 'react';

export function OperatorRemoveStake({
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
  const [userConfirmingRemoveStake, setUserConfirmingRemoveStake] = useState(false);

  const vestingContract = useActiveVestingContract();

  const handleRemoveStake = () => {
    setIsSubmitting(true);
    setUserConfirmingRemoveStake(true);
  };

  return (
    <>
      {!isRemoveStake ? (
        userConfirmingRemoveStake ? (
          <WithdrawStakeOperatorNotice onContinue={() => setIsRemoveStake(true)} />
        ) : (
          <Button
            variant="destructive"
            className="w-full"
            data-testid={ButtonDataTestId.Stake_Manage_Remove_Stake}
            aria-label={dictionary('buttonRemoveStakeAndRegistration.aria')}
            onClick={handleRemoveStake}
          >
            {dictionary('buttonRemoveStakeAndRegistration.text')}
          </Button>
        )
      ) : null}
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
