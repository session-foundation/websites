import { ContributeFundsFeeActionModuleRow } from '@/app/stake/[address]/ContributeFundsFeeActionModuleRow';
import { type StakeFormSchema, getStakeFormSchema } from '@/app/stake/[address]/NewStake';
import { StakeNotice } from '@/app/stake/[address]/StakeNotice';
import { SubmitContributeFunds } from '@/app/stake/[address]/SubmitContributeFunds';
import { SubmitRemoveFunds } from '@/app/stake/[address]/SubmitRemoveFunds';
import { SubmitRemoveFundsVesting } from '@/app/stake/[address]/SubmitRemoveFundsVesting';
import { ActionModuleRow } from '@/components/ActionModule';
import { EthereumAddressField } from '@/components/Form/EthereumAddressField';
import { StakeAmountField } from '@/components/Form/StakeAmountField';
import { WalletInteractionButtonWithLocales } from '@/components/WalletInteractionButtonWithLocales';
import { WizardSectionDescription } from '@/components/Wizard';
import { useBannedRewardsAddresses } from '@/hooks/useBannedRewardsAddresses';
import type { UseContributeStakeToOpenNodeParams } from '@/hooks/useContributeStakeToOpenNode';
import { useCurrentActor } from '@/hooks/useCurrentActor';
import useRelativeTime from '@/hooks/useRelativeTime';
import {
  BLOCK_TIME_MS,
  PREFERENCE,
  SESSION_NODE_SMALL_CONTRIBUTOR_AMOUNT,
  SESSION_NODE_TIME,
  SESSION_NODE_TIME_STATIC,
} from '@/lib/constants';
import { formatLocalizedTimeFromSeconds, useDecimalDelimiter } from '@/lib/locale-client';
import logger from '@/lib/logger';
import { getContributionRangeFromContributors } from '@/lib/maths';
import { useActiveVestingContract } from '@/providers/vesting-provider';
import { ButtonDataTestId, InputDataTestId } from '@/testing/data-test-ids';
import { zodResolver } from '@hookform/resolvers/zod';
import { SENT_DECIMALS } from '@session/contracts';
import { formatSENTBigIntNoRounding } from '@session/contracts/hooks/Token';
import { ARBITRUM_EVENT } from '@session/staking-api-js/enums';
import type { ContributionContract } from '@session/staking-api-js/schema';
import { EditButton } from '@session/ui/components/EditButton';
import { cn } from '@session/ui/lib/utils';
import { Form, FormErrorMessage, FormField, useForm } from '@session/ui/ui/form';
import { Tooltip } from '@session/ui/ui/tooltip';
import { bigIntToString, stringToBigInt } from '@session/util-crypto/maths';
import { areHexesEqual } from '@session/util-crypto/string';
import { safeTrySync } from '@session/util-js/try';
import { useBlockNumber } from '@session/wallet/hooks/useBlockNumber';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { type Dispatch, type Ref, type SetStateAction, useMemo, useState } from 'react';
import { usePreferences } from 'usepref';
import { type Address, isAddress } from 'viem';
import { SubmitContributeFundsVesting } from './SubmitContributeFundsVesting';

const useWithdrawableStake = ({
  contract,
  address,
}: { contract: ContributionContract; address?: Address }) => {
  const { data: blockNumber } = useBlockNumber();
  const withdrawableBlock = useMemo(() => {
    const contributionEvent = contract.events.find(
      (e) =>
        e.name === ARBITRUM_EVENT.NewContribution &&
        e.args &&
        typeof e.args === 'object' &&
        'contributor' in e.args &&
        typeof e.args.contributor === 'string' &&
        areHexesEqual(e.args.contributor, address)
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

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: kinda has to be
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
  const [isRemoveStake, setIsRemoveStake] = useState<boolean>(false);

  const address = useCurrentActor();
  const { address: connectedAddress } = useWallet();
  const vestingContract = useActiveVestingContract();
  const bannedRewardsAddresses = useBannedRewardsAddresses();

  const dictionary = useTranslations('actionModules.staking.manage');
  const dictionaryShared = useTranslations('actionModules.shared');
  const dictionaryRegistrationShared = useTranslations('actionModules.registration.shared');
  const dictionaryInfoNotice = useTranslations('infoNotice');
  const dictionaryStakeAmount = useTranslations('actionModules.stakeAmount.validation');
  const dictionaryRewardsAddress = useTranslations('actionModules.rewardsAddress.validation');
  const decimalDelimiter = useDecimalDelimiter();

  const isOperator = areHexesEqual(contract.operator_address, address);

  const contributor = contract.contributors.find((contributor) =>
    areHexesEqual(contributor.address, address)
  );

  const { withdrawRelativeTime, withdrawRelativeTimeNoSuffix, isTooSoonToWithdraw } =
    useWithdrawableStake({ contract, address });

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

    setStakingParams({
      stakeAmount: additionalStakeAmount,
      contractAddress: contract.address,
      beneficiary: rewardsAddress,
    });
  };

  const handleEdit = () => {
    setStakingParams(null);
  };

  const handleRemoveStake = () => {
    setStakingParams(null);
    setIsRemoveStake(true);
  };

  const isSmallContributor = contributorStakeAmount < SESSION_NODE_SMALL_CONTRIBUTOR_AMOUNT;

  const removeStakeBaseButton = !isOperator ? (
    <WalletInteractionButtonWithLocales
      type="button"
      variant="destructive"
      className="w-full"
      disabled={!isOperator && isTooSoonToWithdraw}
      data-testid={ButtonDataTestId.Stake_Manage_Remove_Stake}
      aria-label={dictionary('buttonRemoveStake.aria')}
      onClick={handleRemoveStake}
    >
      {dictionary('buttonRemoveStake.text')}
    </WalletInteractionButtonWithLocales>
  ) : null;

  const removeStakeButton =
    !isOperator && isTooSoonToWithdraw ? (
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
            disabled={isRemoveStake || additionalStakeAmount < 1n}
            data-testid={ButtonDataTestId.Stake_Submit_Confirm}
            aria-label={dictionaryRegistrationShared('buttonConfirmAndStake.aria')}
          >
            {dictionaryRegistrationShared('buttonConfirmAndStake.text')}
          </WalletInteractionButtonWithLocales>
          <FormErrorMessage />
        </form>
      </Form>
      {!stakingParams && !isRemoveStake ? removeStakeButton : null}
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
