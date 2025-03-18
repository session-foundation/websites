import { type ErrorBoxProps, ErrorTab } from '@/app/register/[nodeId]/shared/ErrorTab';
import { ContributeFundsFeeActionModuleRow } from '@/app/stake/[address]/ContributeFundsFeeActionModuleRow';
import { StakeInfo, getContributionRangeForWallet } from '@/app/stake/[address]/StakeInfo';
import { SubmitContributeFunds } from '@/app/stake/[address]/SubmitContributeFunds';
import { ActionModuleRow } from '@/components/ActionModule';
import EthereumAddressField, {
  getEthereumAddressFormFieldSchema,
  type GetEthereumAddressFormFieldSchemaArgs,
} from '@/components/Form/EthereumAddressField';
import StakeAmountField, {
  getStakeAmountFormFieldSchema,
  type GetStakeAmountFormFieldSchemaArgs,
} from '@/components/Form/StakeAmountField';
import type { UseContributeStakeToOpenNodeParams } from '@/hooks/useContributeStakeToOpenNode';
import { SESSION_NODE_MIN_STAKE_MULTI_OPERATOR } from '@/lib/constants';
import { useDecimalDelimiter } from '@/lib/locale-client';
import { ButtonDataTestId, InputDataTestId } from '@/testing/data-test-ids';
import { zodResolver } from '@hookform/resolvers/zod';
import { SENT_DECIMALS, SENT_SYMBOL } from '@session/contracts';
import { formatSENTBigIntNoRounding } from '@session/contracts/hooks/Token';
import type { ContributorContractInfo } from '@session/staking-api-js/client';
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
import { useMemo, useState } from 'react';
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

export function NewStake({ contract }: { contract: ContributorContractInfo }) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [stakingParams, setStakingParams] = useState<UseContributeStakeToOpenNodeParams | null>(
    null
  );

  const { address } = useWallet();

  const dictionary = useTranslations('actionModules.staking');
  const dictGeneral = useTranslations('general');
  const dictionaryShared = useTranslations('actionModules.shared');

  const dictionaryStakeAmount = useTranslations('actionModules.stakeAmount.validation');
  const dictionaryEthAddress = useTranslations('actionModules.ethAddress.validation');

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
      required: false,
    },
  });

  const form = useForm<StakeFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rewardsAddress: '',
      stakeAmount: bigIntToString(
        balanceValue ? bigIntMin(minStake, balanceValue) : minStake,
        SENT_DECIMALS,
        decimalDelimiter
      ),
    },
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  const onSubmit = (data: StakeFormSchema) => {
    setIsSubmitting(true);

    if (data.rewardsAddress && !isAddress(data.rewardsAddress)) {
      form.setError('root', {
        type: 'manual',
        message: dictionaryEthAddress('invalidAddress'),
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

    if (!address || !isAddress(address)) {
      form.setError('root', {
        type: 'manual',
        message: dictionaryEthAddress('invalidAddress'),
      });
      return;
    }

    setStakingParams({
      stakeAmount,
      userAddress: address,
      contractAddress: contract.address,
      beneficiary: isAddress(data.rewardsAddress) ? data.rewardsAddress : undefined,
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
                  label={dictionary('rewardsAddress')}
                  tooltip={dictionary('rewardsAddressDescription')}
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
      <ErrorBoundary errorComponent={ErrorStake}>
        {stakingParams ? (
          <SubmitContributeFunds stakingParams={stakingParams} setIsSubmitting={setIsSubmitting} />
        ) : null}
      </ErrorBoundary>
    </StakeInfo>
  );
}

function ErrorStake({ error }: ErrorBoxProps) {
  const dict = useTranslations('actionModules.staking.error');
  return <ErrorTab error={error} dict={dict} />;
}
