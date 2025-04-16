import { ContributeFundsFeeActionModuleRow } from '@/app/stake/[address]/ContributeFundsFeeActionModuleRow';
import { type StakeFormSchema, getStakeFormSchema } from '@/app/stake/[address]/NewStake';
import { SubmitContributeFunds } from '@/app/stake/[address]/SubmitContributeFunds';
import { SubmitRemoveFunds } from '@/app/stake/[address]/SubmitRemoveFunds';
import { SubmitRemoveFundsVesting } from '@/app/stake/[address]/SubmitRemoveFundsVesting';
import { ActionModuleRow } from '@/components/ActionModule';
import EthereumAddressField from '@/components/Form/EthereumAddressField';
import StakeAmountField from '@/components/Form/StakeAmountField';
import { useBannedRewardsAddresses } from '@/hooks/useBannedRewardsAddresses';
import type { UseContributeStakeToOpenNodeParams } from '@/hooks/useContributeStakeToOpenNode';
import { useCurrentActor } from '@/hooks/useCurrentActor';
import { useDecimalDelimiter } from '@/lib/locale-client';
import { getContributionRangeFromContributors } from '@/lib/maths';
import { useActiveVestingContract } from '@/providers/vesting-provider';
import { ButtonDataTestId, InputDataTestId } from '@/testing/data-test-ids';
import { zodResolver } from '@hookform/resolvers/zod';
import { SENT_DECIMALS } from '@session/contracts';
import { formatSENTBigIntNoRounding } from '@session/contracts/hooks/Token';
import type { ContributionContract } from '@session/staking-api-js/schema';
import { EditButton } from '@session/ui/components/EditButton';
import { cn } from '@session/ui/lib/utils';
import { Button } from '@session/ui/ui/button';
import { Form, FormErrorMessage, FormField, useForm } from '@session/ui/ui/form';
import { bigIntToString, stringToBigInt } from '@session/util-crypto/maths';
import { areHexesEqual } from '@session/util-crypto/string';
import { safeTrySync } from '@session/util-js/try';
import { useTranslations } from 'next-intl';
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import { isAddress } from 'viem';
import { SubmitContributeFundsVesting } from './SubmitContributeFundsVesting';

export function ManageStakeContribution({
  contract,
  isSubmitting,
  setIsSubmitting,
}: {
  contract: ContributionContract;
  isSubmitting: boolean;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
}) {
  const [stakingParams, setStakingParams] = useState<UseContributeStakeToOpenNodeParams | null>(
    null
  );
  const [isRemoveStake, setIsRemoveStake] = useState<boolean>(false);

  const address = useCurrentActor();
  const vestingContract = useActiveVestingContract();
  const bannedRewardsAddresses = useBannedRewardsAddresses();

  const dictionary = useTranslations('actionModules.staking.manage');
  const dictionaryShared = useTranslations('actionModules.shared');
  const dictionaryRegistrationShared = useTranslations('actionModules.registration.shared');

  const dictionaryStakeAmount = useTranslations('actionModules.stakeAmount.validation');
  const dictionaryEthAddress = useTranslations('actionModules.ethAddress.validation');
  const dictionaryRewardsAddress = useTranslations('actionModules.rewardsAddress.validation');
  const decimalDelimiter = useDecimalDelimiter();

  const isOperator = areHexesEqual(contract.operator_address, address);

  // TODO: implement the remove stake amount limit feature
  // const stakeAmountLastEdited = new Date('2025-06-06').getTime();
  //
  // /** If the time since the last stake update is within the
  //  *  last {@link SESSION_NODE_TIME_STATIC.NON_FINALIZED_TIME_TO_REMOVE_STAKE_MS} ms, the
  //  *  user can remove the stake amount */
  // const isStakeAmountRemovable = useMemo(
  //   () =>
  //     stakeAmountLastEdited + SESSION_NODE_TIME_STATIC.NON_FINALIZED_TIME_TO_REMOVE_STAKE_MS <
  //     Date.now(),
  //   [stakeAmountLastEdited]
  // );

  const contributor = contract.contributors.find((contributor) =>
    areHexesEqual(contributor.address, address)
  );

  const contributorStakeAmount = useMemo(() => {
    if (!contributor || !contributor.amount) return 0n;

    const [err, amount] = safeTrySync(() => BigInt(contributor.amount));
    if (err) return 0n;

    return amount;
  }, [contributor]);

  const { maxStake: maxStakeNew } = getContributionRangeFromContributors(contract.contributors);

  const minStake = contributorStakeAmount;
  const maxStake = contributorStakeAmount + maxStakeNew;

  const formSchema = getStakeFormSchema({
    stakeAmount: {
      isOperator,
      decimalDelimiter,
      minStake: contributorStakeAmount,
      maxStake,
      underMinMessage: dictionaryStakeAmount('reduceForbidden'),
      underMinOperatorMessage: dictionaryStakeAmount('reduceForbidden'),
      overMaxMessage: dictionaryStakeAmount('overMax', {
        max: formatSENTBigIntNoRounding(maxStake),
      }),
    },
    rewardsAddress: {
      required: !!vestingContract,
      bannedAddresses: bannedRewardsAddresses,
    },
  });

  const form = useForm<StakeFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rewardsAddress: contributor?.beneficiary_address ?? '',
      stakeAmount: bigIntToString(contributorStakeAmount, SENT_DECIMALS, decimalDelimiter),
    },
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  const watchedStakeAmount = form.watch('stakeAmount');

  const watchedStakeAmountBigInt = useMemo(() => {
    const [err, amount] = safeTrySync(() => stringToBigInt(watchedStakeAmount, SENT_DECIMALS));
    if (err) return null;

    return amount;
  }, [watchedStakeAmount]);

  const additionalStakeAmount = useMemo(() => {
    if (!watchedStakeAmountBigInt || !contributorStakeAmount) return 0n;
    return watchedStakeAmountBigInt - contributorStakeAmount;
  }, [watchedStakeAmountBigInt, contributorStakeAmount]);

  const onSubmit = (data: StakeFormSchema) => {
    setIsSubmitting(true);

    if (data.rewardsAddress) {
      if (!isAddress(data.rewardsAddress)) {
        form.setError('root', {
          type: 'manual',
          message: dictionaryRewardsAddress('invalidAddress'),
        });
        return;
      }

      if (
        bannedRewardsAddresses.some(({ address }) => areHexesEqual(address, data.rewardsAddress))
      ) {
        form.setError('root', {
          type: 'manual',
          message: dictionaryRewardsAddress('bannedVestingContract'),
        });
        return;
      }
      // If there is a vesting contract the rewards address is required
    } else if (vestingContract) {
      form.setError('root', {
        type: 'manual',
        message: dictionaryRewardsAddress('invalidAddress'),
      });
      return;
    }

    if (!address || !isAddress(address)) {
      form.setError('root', {
        type: 'manual',
        message: dictionaryEthAddress('invalidAddress'),
      });
      return;
    }

    setStakingParams({
      stakeAmount: additionalStakeAmount,
      userAddress: address,
      contractAddress: contract.address,
      beneficiary: isAddress(data.rewardsAddress) ? data.rewardsAddress : undefined,
    });
  };

  const handleEdit = () => {
    setStakingParams(null);
  };

  const handleRemoveStake = () => {
    setStakingParams(null);
    setIsRemoveStake(true);
  };

  return (
    <>
      {stakingParams ? (
        <ActionModuleRow
          label={dictionary('stakeAmountAdditional')}
          tooltip={dictionary('stakeAmountAdditionalDescription')}
        >
          <span className="font-semibold">{formatSENTBigIntNoRounding(additionalStakeAmount)}</span>
          <EditButton
            onClick={handleEdit}
            disabled={isSubmitting}
            data-testid={ButtonDataTestId.Stake_Manage_Stake_Edit_Stake_Amount}
          />
        </ActionModuleRow>
      ) : null}
      <ContributeFundsFeeActionModuleRow
        contract={contract}
        stakeAmount={additionalStakeAmount}
        minStake={minStake}
        maxStake={maxStake}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(stakingParams || isRemoveStake ? 'hidden' : 'flex flex-col gap-4')}
        >
          <FormField
            control={form.control}
            name="stakeAmount"
            render={({ field }) => (
              <StakeAmountField
                minStake={minStake}
                maxStake={maxStake}
                watchedStakeAmount={form.watch('stakeAmount')}
                field={field}
                dataTestId={InputDataTestId.Stake_Manage_Stake_Stake_Amount}
                dataTestIds={{
                  buttonMin: ButtonDataTestId.Stake_Manage_Stake_Stake_Amount_Min,
                  buttonMax: ButtonDataTestId.Stake_Manage_Stake_Stake_Amount_Max,
                  slider0: ButtonDataTestId.Stake_Manage_Stake_Stake_Amount_Slider_0,
                  slider25: ButtonDataTestId.Stake_Manage_Stake_Stake_Amount_Slider_25,
                  slider50: ButtonDataTestId.Stake_Manage_Stake_Stake_Amount_Slider_50,
                  slider75: ButtonDataTestId.Stake_Manage_Stake_Stake_Amount_Slider_75,
                  slider100: ButtonDataTestId.Stake_Manage_Stake_Stake_Amount_Slider_100,
                  sliderMin: ButtonDataTestId.Stake_Manage_Stake_Stake_Amount_Slider_Min,
                  sliderMax: ButtonDataTestId.Stake_Manage_Stake_Stake_Amount_Slider_Max,
                }}
              />
            )}
          />
          <FormField
            control={form.control}
            name="rewardsAddress"
            render={({ field }) => (
              <EthereumAddressField
                // @ts-expect-error -- TODO: type this
                field={field}
                label={dictionaryShared('rewardsAddress')}
                tooltip={dictionaryShared('rewardsAddressDescription')}
                dataTestId={InputDataTestId.Stake_Manage_Stake_Rewards_Address}
              />
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isRemoveStake || additionalStakeAmount < 1n}
            data-testid={ButtonDataTestId.Stake_Submit_Confirm}
            aria-label={dictionaryRegistrationShared('buttonConfirmAndStake.aria')}
          >
            {dictionaryRegistrationShared('buttonConfirmAndStake.text')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            data-testid={ButtonDataTestId.Stake_Manage_Remove_Stake}
            aria-label={dictionary('buttonRemoveStake.aria')}
            onClick={handleRemoveStake}
          >
            {dictionary('buttonRemoveStake.text')}
          </Button>
          <FormErrorMessage />
        </form>
      </Form>
      {stakingParams ? (
        vestingContract ? (
          <SubmitContributeFundsVesting
            stakingParams={stakingParams}
            setIsSubmitting={setIsSubmitting}
          />
        ) : (
          <SubmitContributeFunds stakingParams={stakingParams} setIsSubmitting={setIsSubmitting} />
        )
      ) : null}
      {isRemoveStake ? (
        vestingContract ? (
          <SubmitRemoveFundsVesting
            setIsSubmitting={setIsSubmitting}
            contractAddress={contract.address}
          />
        ) : (
          <SubmitRemoveFunds setIsSubmitting={setIsSubmitting} contractAddress={contract.address} />
        )
      ) : null}
    </>
  );
}
