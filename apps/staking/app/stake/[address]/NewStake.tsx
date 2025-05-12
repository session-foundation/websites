import { ErrorTab } from '@/app/register/[nodeId]/shared/ErrorTab';
import { ContributeFundsFeeActionModuleRow } from '@/app/stake/[address]/ContributeFundsFeeActionModuleRow';
import { StakeInfo, getContributionRangeForWallet } from '@/app/stake/[address]/StakeInfo';
import { StakeNotice } from '@/app/stake/[address]/StakeNotice';
import { SubmitContributeFunds } from '@/app/stake/[address]/SubmitContributeFunds';
import { SubmitContributeFundsVesting } from '@/app/stake/[address]/SubmitContributeFundsVesting';
import { ActionModuleRow } from '@/components/ActionModule';
import type { ErrorBoxProps } from '@/components/Error/ErrorBox';
import {
  EthereumAddressField,
  type GetEthereumAddressFormFieldSchemaArgs,
  getEthereumAddressFormFieldSchema,
} from '@/components/Form/EthereumAddressField';
import {
  type GetStakeAmountFormFieldSchemaArgs,
  StakeAmountField,
  getStakeAmountFormFieldSchema,
} from '@/components/Form/StakeAmountField';
import { useBannedRewardsAddresses } from '@/hooks/useBannedRewardsAddresses';
import type { UseContributeStakeToOpenNodeParams } from '@/hooks/useContributeStakeToOpenNode';
import { useCurrentActor } from '@/hooks/useCurrentActor';
import { PREFERENCE, SESSION_NODE_MIN_STAKE_MULTI_OPERATOR } from '@/lib/constants';
import { useDecimalDelimiter } from '@/lib/locale-client';
import { useVesting } from '@/providers/vesting-provider';
import { ButtonDataTestId, InputDataTestId } from '@/testing/data-test-ids';
import { zodResolver } from '@hookform/resolvers/zod';
import { SENT_DECIMALS, SENT_SYMBOL } from '@session/contracts';
import { formatSENTBigIntNoRounding } from '@session/contracts/hooks/Token';
import type { ContributionContract } from '@session/staking-api-js/schema';
import { EditButton } from '@session/ui/components/EditButton';
import { PubKey } from '@session/ui/components/PubKey';
import { cn } from '@session/ui/lib/utils';
import { Button } from '@session/ui/ui/button';
import { Form, FormErrorMessage, FormField, useForm } from '@session/ui/ui/form';
import { bigIntMin, bigIntToString, stringToBigInt } from '@session/util-crypto/maths';
import { areHexesEqual } from '@session/util-crypto/string';
import { safeTrySync } from '@session/util-js/try';
import { useWalletTokenBalance } from '@session/wallet/components/WalletButton';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import { useEffect, useMemo, useState } from 'react';
import { usePreferences } from 'usepref';
import { isAddress } from 'viem';
import { z } from 'zod';

type GetStakeFormSchemaArgs = {
  stakeAmount: GetStakeAmountFormFieldSchemaArgs;
  rewardsAddress: GetEthereumAddressFormFieldSchemaArgs;
};

export const getStakeFormSchema = ({ stakeAmount, rewardsAddress }: GetStakeFormSchemaArgs) =>
  z.object({
    rewardsAddress: getEthereumAddressFormFieldSchema(rewardsAddress),
    stakeAmount: getStakeAmountFormFieldSchema(stakeAmount),
  });

export type StakeFormSchema = z.infer<ReturnType<typeof getStakeFormSchema>>;

export function NewStake({
  contract,
  refetch,
}: { contract: ContributionContract; refetch: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { getItem } = usePreferences();
  const [acceptedNotice, setAcceptedNotice] = useState<boolean>(
    !!getItem(PREFERENCE.INFO_NOTICE_DONT_SHOW_STAKE)
  );
  const [stakingParams, setStakingParams] = useState<UseContributeStakeToOpenNodeParams | null>(
    null
  );

  const address = useCurrentActor();
  const { address: connectedAddress } = useWallet();
  const { activeContract: vestingContract, isLoading } = useVesting();

  const bannedRewardsAddresses = useBannedRewardsAddresses();

  const dictionary = useTranslations('actionModules.staking');
  const dictGeneral = useTranslations('general');
  const dictionaryShared = useTranslations('actionModules.shared');

  const dictionaryStakeAmount = useTranslations('actionModules.stakeAmount.validation');
  const dictionaryRewardsAddress = useTranslations('actionModules.rewardsAddress.validation');

  const decimalDelimiter = useDecimalDelimiter();

  const isOperator = areHexesEqual(contract.operator_address, address);

  const { value: balanceValue } = useWalletTokenBalance();

  const { minStake, maxStake } = getContributionRangeForWallet(contract, address);

  const allowNewStake = minStake > 0n || maxStake > 0n;

  const formSchema = getStakeFormSchema({
    stakeAmount: {
      isOperator,
      decimalDelimiter,
      minStake,
      maxStake,
      underMinMessage: dictionaryStakeAmount('underMin', {
        min: formatSENTBigIntNoRounding(
          isOperator ? SESSION_NODE_MIN_STAKE_MULTI_OPERATOR : minStake
        ),
      }),
      underMinOperatorMessage: dictionaryStakeAmount('underMinOperator', {
        min: formatSENTBigIntNoRounding(SESSION_NODE_MIN_STAKE_MULTI_OPERATOR),
      }),
      overMaxMessage: dictionaryStakeAmount('overMax', {
        max: formatSENTBigIntNoRounding(maxStake),
      }),
    },
    rewardsAddress: {
      required: !!vestingContract,
      bannedAddresses: bannedRewardsAddresses,
    },
  });

  const defaultValues = useMemo(() => {
    return {
      rewardsAddress: vestingContract ? (connectedAddress ?? '') : '',
      stakeAmount: bigIntToString(
        balanceValue ? bigIntMin(minStake, balanceValue) : minStake,
        SENT_DECIMALS,
        decimalDelimiter
      ),
    };
  }, [vestingContract, connectedAddress, balanceValue, minStake, decimalDelimiter]);

  const form = useForm<StakeFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues,
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  const onSubmit = (data: StakeFormSchema) => {
    setIsSubmitting(true);

    let rewardsAddress = data.rewardsAddress;
    if (rewardsAddress) {
      if (bannedRewardsAddresses.some(({ address }) => areHexesEqual(address, rewardsAddress))) {
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

    const [errBigInt, stakeAmount] = safeTrySync(() =>
      stringToBigInt(data.stakeAmount, SENT_DECIMALS)
    );

    if (errBigInt) {
      form.setError('root', {
        type: 'manual',
        message: dictionaryStakeAmount('incorrectFormat'),
      });
      return;
    }

    setStakingParams({
      stakeAmount: stakeAmount,
      contractAddress: contract.address,
      beneficiary: rewardsAddress,
    });
  };

  const handleEdit = () => {
    setStakingParams(null);
  };

  const watchedStakeAmount = form.watch('stakeAmount');

  const watchedStakeAmountBigInt = useMemo(() => {
    const [err, amount] = safeTrySync(() => stringToBigInt(watchedStakeAmount, SENT_DECIMALS));
    if (err) return 0n;

    return amount;
  }, [watchedStakeAmount]);

  const watchedRewardsAddress = form.watch('rewardsAddress');

  useEffect(() => {
    if (!isLoading) {
      form.reset(defaultValues);
    }
  }, [isLoading, defaultValues, form]);

  return (
    <StakeInfo contract={contract} isSubmitting={isSubmitting}>
      {address ? (
        <ContributeFundsFeeActionModuleRow
          contract={contract}
          stakeAmount={watchedStakeAmountBigInt}
          minStake={minStake}
          maxStake={maxStake}
        />
      ) : null}
      {stakingParams ? (
        <>
          <ActionModuleRow
            label={dictionaryShared('rewardsAddress')}
            tooltip={dictionaryShared('rewardsAddressDescription')}
          >
            {watchedRewardsAddress ? (
              <PubKey
                pubKey={watchedRewardsAddress}
                force="collapse"
                alwaysShowCopyButton
                leadingChars={8}
                trailingChars={4}
                className="font-semibold"
              />
            ) : (
              dictGeneral('none')
            )}
            <EditButton
              onClick={handleEdit}
              disabled={isSubmitting}
              data-testid={ButtonDataTestId.Stake_New_Stake_Edit_Rewards_Address}
            />
          </ActionModuleRow>
          <ActionModuleRow
            label={dictionaryShared('stakeAmount')}
            tooltip={dictionaryShared('stakeAmountDescription')}
          >
            <span className="font-semibold">
              {watchedStakeAmount} {SENT_SYMBOL}
            </span>
            <EditButton
              onClick={handleEdit}
              disabled={isSubmitting}
              data-testid={ButtonDataTestId.Stake_New_Stake_Edit_Stake_Amount}
            />
          </ActionModuleRow>
        </>
      ) : null}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            address && !stakingParams && allowNewStake ? 'flex flex-col gap-4' : 'hidden'
          )}
        >
          {!stakingParams ? (
            <FormField
              control={form.control}
              name="stakeAmount"
              render={({ field }) => (
                <StakeAmountField
                  minStake={minStake}
                  maxStake={maxStake}
                  watchedStakeAmount={watchedStakeAmount}
                  field={field}
                  dataTestId={InputDataTestId.Stake_New_Stake_Stake_Amount}
                  dataTestIds={{
                    buttonMin: ButtonDataTestId.Stake_New_Stake_Stake_Amount_Min,
                    buttonMax: ButtonDataTestId.Stake_New_Stake_Stake_Amount_Max,
                    slider0: ButtonDataTestId.Stake_New_Stake_Stake_Amount_Slider_0,
                    slider25: ButtonDataTestId.Stake_New_Stake_Stake_Amount_Slider_25,
                    slider50: ButtonDataTestId.Stake_New_Stake_Stake_Amount_Slider_50,
                    slider75: ButtonDataTestId.Stake_New_Stake_Stake_Amount_Slider_75,
                    slider100: ButtonDataTestId.Stake_New_Stake_Stake_Amount_Slider_100,
                    sliderMin: ButtonDataTestId.Stake_New_Stake_Stake_Amount_Slider_Min,
                    sliderMax: ButtonDataTestId.Stake_New_Stake_Stake_Amount_Slider_Max,
                  }}
                />
              )}
            />
          ) : null}
          {!stakingParams ? (
            <FormField
              control={form.control}
              name="rewardsAddress"
              render={({ field }) => (
                <EthereumAddressField
                  // @ts-expect-error -- TODO: type this
                  field={field}
                  label={dictionary(vestingContract ? 'rewardsAddressVesting' : 'rewardsAddress')}
                  tooltip={dictionary(
                    vestingContract
                      ? 'rewardsAddressVestingDescription'
                      : 'rewardsAddressDescription'
                  )}
                  dataTestId={InputDataTestId.Stake_New_Stake_Rewards_Address}
                />
              )}
            />
          ) : null}
          <Button
            type="submit"
            className="w-full"
            data-testid={ButtonDataTestId.Stake_Submit_Confirm}
            aria-label={dictionary('buttonStake.aria')}
          >
            {dictionary('buttonStake.text')}
          </Button>
          <FormErrorMessage />
        </form>
      </Form>
      {stakingParams && !acceptedNotice ? (
        <StakeNotice
          onContinue={() => setAcceptedNotice(true)}
          onCancel={() => {
            setIsSubmitting(false);
            setStakingParams(null);
          }}
          stakeAmount={stakingParams.stakeAmount}
        />
      ) : null}
      <ErrorBoundary errorComponent={ErrorStake}>
        {acceptedNotice && stakingParams ? (
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
      </ErrorBoundary>
    </StakeInfo>
  );
}

function ErrorStake({ error }: ErrorBoxProps) {
  const dict = useTranslations('actionModules.staking.error');
  return <ErrorTab error={error} dict={dict} />;
}
