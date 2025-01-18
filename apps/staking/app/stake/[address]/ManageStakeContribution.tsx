import type { UseContributeStakeToOpenNodeParams } from '@/hooks/useContributeStakeToOpenNode';
import { useDecimalDelimiter } from '@/lib/locale-client';
import { ButtonDataTestId, InputDataTestId } from '@/testing/data-test-ids';
import { SENT_DECIMALS } from '@session/contracts';
import { cn } from '@session/ui/lib/utils';
import { Button } from '@session/ui/ui/button';
import { Form, FormErrorMessage, FormField, useForm } from '@session/ui/ui/form';
import { bigIntToString, stringToBigInt } from '@session/util-crypto/maths';
import { safeTrySync } from '@session/util-js/try';
import { useTranslations } from 'next-intl';
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import { SESSION_NODE_TIME_STATIC } from '@/lib/constants';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { areHexesEqual } from '@session/util-crypto/string';
import type { ContributorContractInfo } from '@session/staking-api-js/client';
import { formatSENTBigIntNoRounding } from '@session/contracts/hooks/Token';
import { zodResolver } from '@hookform/resolvers/zod';
import { getContributionRangeFromContributors } from '@/lib/maths';
import { getStakeFormSchema, type StakeFormSchema } from '@/app/stake/[address]/NewStake';
import { isAddress } from 'viem';
import StakeAmountField from '@/components/Form/StakeAmountField';
import EthereumAddressField from '@/components/Form/EthereumAddressField';
import { SubmitContributeFunds } from '@/app/stake/[address]/SubmitContributeFunds';
import { ActionModuleRow } from '@/components/ActionModule';
import { EditButton } from '@session/ui/components/EditButton';
import { SubmitRemoveFunds } from '@/app/stake/[address]/SubmitRemoveFunds';
import { ContributeFundsFeeActionModuleRow } from '@/app/stake/[address]/ContributeFundsFeeActionModuleRow';

export function ManageStakeContribution({
  contract,
  isSubmitting,
  setIsSubmitting,
  setIsError,
}: {
  contract: ContributorContractInfo;
  isSubmitting: boolean;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  setIsError: Dispatch<SetStateAction<boolean>>;
}) {
  const [stakingParams, setStakingParams] = useState<UseContributeStakeToOpenNodeParams | null>(
    null
  );
  const [isRemoveStake, setIsRemoveStake] = useState<boolean>(false);

  const { address } = useWallet();

  const dictionary = useTranslations('actionModules.staking.manage');
  const dictionaryShared = useTranslations('actionModules.shared');
  const dictionaryRegistrationShared = useTranslations('actionModules.registration.shared');

  const dictionaryStakeAmount = useTranslations('actionModules.stakeAmount.validation');

  const decimalDelimiter = useDecimalDelimiter();

  const isOperator = areHexesEqual(contract.operator_address, address);

  // TODO: get real time, for now always disabled
  const stakeAmountLastEdited = new Date('2025-06-06').getTime();

  /** If the time since the last stake update is within the
   *  last {@link SESSION_NODE_TIME_STATIC.NON_FINALIZED_TIME_TO_REMOVE_STAKE_MS} ms, the
   *  user can remove the stake amount */
  const isStakeAmountRemovable = useMemo(
    () =>
      stakeAmountLastEdited + SESSION_NODE_TIME_STATIC.NON_FINALIZED_TIME_TO_REMOVE_STAKE_MS <
      Date.now(),
    [stakeAmountLastEdited]
  );

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
      required: false,
    },
  });

  const form = useForm<StakeFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rewardsAddress: contributor?.beneficiary ?? address,
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

    if (data.rewardsAddress && !isAddress(data.rewardsAddress)) {
      form.setError('root', {
        type: 'manual',
        message: 'Rewards Address is not a valid Ethereum Address',
      });
      return;
    }

    setStakingParams({
      stakeAmount: additionalStakeAmount,
      userAddress: address,
      contractAddress: contract.address,
      beneficiary: data.rewardsAddress,
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
        <SubmitContributeFunds
          stakingParams={stakingParams}
          setIsSubmitting={setIsSubmitting}
          setIsError={setIsError}
        />
      ) : null}
      {isRemoveStake ? (
        <SubmitRemoveFunds
          setIsSubmitting={setIsSubmitting}
          setIsError={setIsError}
          contractAddress={contract.address}
        />
      ) : null}
    </>
  );
}
