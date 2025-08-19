import { ContributeFundsFeeActionModuleRow } from '@/app/stake/[address]/ContributeFundsFeeActionModuleRow';
import { type StakeFormSchema, getStakeFormSchema } from '@/app/stake/[address]/NewStake';
import { StakeNotice } from '@/app/stake/[address]/StakeNotice';
import { SubmitContributeFunds } from '@/app/stake/[address]/SubmitContributeFunds';
import { ActionModuleRow } from '@/components/ActionModule';
import { EthereumAddressField } from '@/components/Form/EthereumAddressField';
import { StakeAmountField } from '@/components/Form/StakeAmountField';
import { WalletInteractionButtonWithLocales } from '@/components/WalletInteractionButtonWithLocales';
import { useBannedRewardsAddresses } from '@/hooks/useBannedRewardsAddresses';
import type { UseContributeStakeToOpenNodeParams } from '@/hooks/useContributeStakeToOpenNode';
import { PREFERENCE } from '@/lib/constants';
import { useDecimalDelimiter } from '@/lib/locale-client';
import { getContributionRangeFromContributors } from '@/lib/maths';
import { useUser } from '@/providers/user-provider';
import { useActiveVestingContract } from '@/providers/vesting-provider';
import { ButtonDataTestId, InputDataTestId } from '@/testing/data-test-ids';
import { zodResolver } from '@hookform/resolvers/zod';
import { SENT_DECIMALS } from '@session/contracts';
import { formatSENTBigIntNoRounding } from '@session/contracts/hooks/Token';
import type { ContributionContract } from '@session/staking-api-js/schema';
import { EditButton } from '@session/ui/components/EditButton';
import { cn } from '@session/ui/lib/utils';
import { Form, FormErrorMessage, FormField, useForm } from '@session/ui/ui/form';
import { isEthereumAddress } from '@session/util-crypto/keys';
import { bigIntToString, stringToBigInt } from '@session/util-crypto/maths';
import { areEthereumAddressesEqual } from '@session/util-crypto/string';
import { safeTrySync } from '@session/util-js/try';
import { useTranslations } from 'next-intl';
import { type Dispatch, type Ref, type SetStateAction, useMemo, useState } from 'react';
import { usePreferences } from 'usepref';
import { isAddress } from 'viem';
import { SubmitContributeFundsVesting } from './SubmitContributeFundsVesting';

export function ManageStakeContribution({
  contract,
  isSubmitting,
  setIsSubmitting,
  refetch,
  stakeAmountRef,
  rewardsAddressRef,
}: {
  contract: ContributionContract;
  isSubmitting: boolean;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  refetch: () => void;
  stakeAmountRef: Ref<HTMLInputElement>;
  rewardsAddressRef: Ref<HTMLInputElement>;
}) {
  const { getItem } = usePreferences();
  const [acceptedTopUpNotice, setAcceptedTopUpNotice] = useState<boolean>(
    !!getItem(PREFERENCE.INFO_NOTICE_DONT_SHOW_STAKE_TOP_UP)
  );
  const [stakingParams, setStakingParams] = useState<UseContributeStakeToOpenNodeParams | null>(
    null
  );

  const { activeAddress, connectedAddress } = useUser();
  const vestingContract = useActiveVestingContract();
  const bannedRewardsAddresses = useBannedRewardsAddresses();

  const dictionary = useTranslations('actionModules.staking.manage');
  const dictionaryShared = useTranslations('actionModules.shared');
  const dictionaryRegistrationShared = useTranslations('actionModules.registration.shared');
  const dictionaryStakeAmount = useTranslations('actionModules.stakeAmount.validation');
  const dictionaryRewardsAddress = useTranslations('actionModules.rewardsAddress.validation');
  const decimalDelimiter = useDecimalDelimiter();

  const isOperator = useMemo(
    () => areEthereumAddressesEqual(contract.operator_address, activeAddress),
    [activeAddress, contract.operator_address]
  );

  const contributor = useMemo(
    () =>
      contract.contributors.find((contributor) =>
        areEthereumAddressesEqual(contributor.address, activeAddress)
      ),
    [activeAddress, contract.contributors]
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

    // TODO: this should not be required, the schema should infer the type properly but I cant seem to get it to work.
    let rewardsAddress = isEthereumAddress(data.rewardsAddress) ? data.rewardsAddress : undefined;
    if (rewardsAddress) {
      if (
        bannedRewardsAddresses.some(({ address }) =>
          areEthereumAddressesEqual(address, rewardsAddress)
        )
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
    } else {
      if (!connectedAddress) {
        form.setError('root', {
          type: 'manual',
          message: dictionaryRewardsAddress('invalidAddress'),
        });
        return;
      }
      rewardsAddress = connectedAddress;
    }

    if (!isAddress(rewardsAddress)) {
      form.setError('root', {
        type: 'manual',
        message: dictionaryRewardsAddress('invalidAddress'),
      });
      return;
    }

    setStakingParams({
      stakeAmount: additionalStakeAmount,
      contractAddress: contract.address,
      beneficiary: rewardsAddress,
    });
  };

  const handleEdit = () => {
    setStakingParams(null);
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
          className={cn(stakingParams ? 'hidden' : 'flex flex-col gap-4')}
        >
          <FormField
            control={form.control}
            name="stakeAmount"
            render={({ field }) => (
              <StakeAmountField
                ref={stakeAmountRef}
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
                ref={rewardsAddressRef}
                // @ts-expect-error -- TODO: type this
                field={field}
                label={dictionaryShared('rewardsAddress')}
                tooltip={dictionaryShared('rewardsAddressDescription')}
                dataTestId={InputDataTestId.Stake_Manage_Stake_Rewards_Address}
              />
            )}
          />
          <WalletInteractionButtonWithLocales
            type="submit"
            className="w-full"
            disabled={additionalStakeAmount < 1n}
            data-testid={ButtonDataTestId.Stake_Submit_Confirm}
            aria-label={dictionaryRegistrationShared('buttonConfirmAndStake.aria')}
          >
            {dictionaryRegistrationShared('buttonConfirmAndStake.text')}
          </WalletInteractionButtonWithLocales>
          <FormErrorMessage />
        </form>
      </Form>
      {!isOperator && stakingParams && !acceptedTopUpNotice ? (
        <StakeNotice
          onContinue={() => setAcceptedTopUpNotice(true)}
          onCancel={() => {
            setStakingParams(null);
            setIsSubmitting(false);
          }}
          stakeAmount={contributorStakeAmount + stakingParams.stakeAmount}
        />
      ) : null}
      {stakingParams && (isOperator || acceptedTopUpNotice) ? (
        vestingContract ? (
          <SubmitContributeFundsVesting
            stakingParams={stakingParams}
            setIsSubmitting={setIsSubmitting}
            refetch={refetch}
          />
        ) : (
          <SubmitContributeFunds
            stakingParams={stakingParams}
            setIsSubmitting={setIsSubmitting}
            refetch={refetch}
          />
        )
      ) : null}
    </>
  );
}
