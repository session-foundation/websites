'use client';

import type { AddressModuleProps } from '@/app/mystakes/modules/types';
import { ActionModuleRow } from '@/components/ActionModule';
import { ActionModuleFeeAccordionRow } from '@/components/ActionModuleFeeAccordionRow';
import { ErrorMessage } from '@/components/ErrorMessage';
import ModuleButtonDialogTrigger from '@/components/ModuleButtonDialogTrigger';
import useClaimRewards from '@/hooks/useClaimRewards';
import { useNetworkFeeFormula } from '@/hooks/useNetworkFeeFormula';
import { useUnclaimedTokens } from '@/hooks/useUnclaimedTokens';
import { HANDRAIL_THRESHOLD_DYNAMIC, QUERY, SIGNIFICANT_FIGURES, URL } from '@/lib/constants';
import { REMOTE_FEATURE_FLAG } from '@/lib/feature-flags';
import { useRemoteFeatureFlagQuery } from '@/lib/feature-flags-client';
import { externalLink } from '@/lib/locale-defaults';
import { getRewardsClaimSignature } from '@/lib/queries/getRewardsClaimSignature';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import type { BlsRewardsSignatureResponse } from '@session/staking-api-js/schema';
import { Loading } from '@session/ui/components/loading';
import { PROGRESS_STATUS, Progress } from '@session/ui/components/motion/progress';
import type { PresentIcon } from '@session/ui/icons/PresentIcon';
import { toast } from '@session/ui/lib/toast';
import { AlertDialogFooter } from '@session/ui/ui/alert-dialog';
import { Button } from '@session/ui/ui/button';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import type { Address } from 'viem';

export type ClaimTokensModuleProps = AddressModuleProps & {
  dictionary?: ReturnType<typeof useTranslations<'modules.claim'>>;
  textClassName?: string;
  iconOverride?: typeof PresentIcon;
  iconStrokeForFill?: boolean;
};

export default function ClaimTokensModule({
  addressOverride,
  dictionary,
  iconOverride,
  iconStrokeForFill,
  textClassName,
}: ClaimTokensModuleProps) {
  const { address: connectedAddress } = useWallet();
  const fallbackDict = useTranslations('modules.claim');
  const dict = dictionary ?? fallbackDict;
  const { canClaim, unclaimedRewards } = useUnclaimedTokens({ addressOverride });
  const { enabled: isClaimRewardsDisabled, isLoading: isRemoteFlagLoading } =
    useRemoteFeatureFlagQuery(REMOTE_FEATURE_FLAG.DISABLE_CLAIM_REWARDS);

  const address = addressOverride ?? connectedAddress;

  return (
    <ModuleButtonDialogTrigger
      dialogContent={address ? <ClaimTokensDialog address={address} /> : null}
      dialogTitle={dict('title')}
      label={dict('title')}
      data-testid={ButtonDataTestId.Claim_Tokens_Open_Dialog}
      disabled={
        !(address && canClaim && unclaimedRewards) || isRemoteFlagLoading || isClaimRewardsDisabled
      }
      IconComp={iconOverride}
      textClassName={textClassName}
      iconStrokeForFill={iconStrokeForFill}
    />
  );
}

function ClaimTokensDialog({ address }: { address: Address }) {
  const dictionary = useTranslations('modules.claim');
  const { canClaim, refetch } = useUnclaimedTokens({ addressOverride: address });

  const { data: claimData, isError } = useStakingBackendQueryWithParams(
    getRewardsClaimSignature,
    { address },
    {
      enabled: !!address && canClaim,
      staleTime: QUERY.STALE_TIME_CLAIM_REWARDS,
    }
  );

  return (
    <>
      {isError ? (
        <ErrorMessage
          refetch={refetch}
          message={dictionary.rich('error')}
          buttonText={dictionary('errorButton')}
          buttonDataTestId={ButtonDataTestId.Claim_Tokens_Error_Retry}
        />
      ) : claimData && address ? (
        <ClaimTokens claimData={claimData} address={address} />
      ) : (
        <Loading />
      )}
    </>
  );
}

function ClaimTokens({
  address,
  claimData,
}: {
  address: Address;
  claimData: BlsRewardsSignatureResponse;
}) {
  const dictionaryFee = useTranslations('fee');
  const dictionaryDialog = useTranslations('modules.claim.dialog');
  const dictionaryStage = useTranslations('modules.claim.stage');
  const [overrideUnclaimedRewardsAmount, setOverrideUnclaimedRewardsAmount] = useState<
    string | null
  >(null);

  const { chainId } = useWallet();
  const { refetch, formattedUnclaimedRewardsAmount } = useUnclaimedTokens({
    addressOverride: address,
  });

  const unclaimedRewardsAmount = overrideUnclaimedRewardsAmount ?? formattedUnclaimedRewardsAmount;

  const claimRewardsArgs = useMemo(
    () => ({
      address,
      rewards: claimData.rewards.amount,
      blsSignature: claimData.rewards.signature,
      excludedSigners: claimData.rewards.non_signer_indices,
    }),
    [address, claimData]
  );

  const {
    updateBalanceAndClaimRewards,
    claimFee,
    claimGasPrice,
    claimGasAmountEstimate,
    updateBalanceFee,
    updateBalanceGasPrice,
    updateBalanceGasAmountEstimate,
    updateRewardsBalanceStatus,
    claimRewardsStatus,
    enabled,
    skipUpdateBalance,
    updateRewardsBalanceErrorMessage,
    claimRewardsErrorMessage,
  } = useClaimRewards(claimRewardsArgs);

  const { feeFormatted: feeEstimateClaim, formula: feeFormulaClaim } = useNetworkFeeFormula({
    fee: claimFee,
    gasAmount: claimGasAmountEstimate,
    gasPrice: claimGasPrice,
    maximumSignificantDigits: SIGNIFICANT_FIGURES.GAS_FEE_BREAKDOWN,
  });

  const { feeFormatted: feeEstimateUpdate, formula: feeFormulaUpdate } = useNetworkFeeFormula({
    fee: updateBalanceFee,
    gasAmount: updateBalanceGasAmountEstimate,
    gasPrice: updateBalanceGasPrice,
    maximumSignificantDigits: SIGNIFICANT_FIGURES.GAS_FEE_BREAKDOWN,
  });

  const { feeFormatted: feeEstimate, formula: feeFormula } = useNetworkFeeFormula({
    fee: updateBalanceFee || claimFee ? (updateBalanceFee ?? 0n) + (claimFee ?? 0n) : null,
    gasAmount:
      updateBalanceGasAmountEstimate || claimGasAmountEstimate
        ? (updateBalanceGasAmountEstimate ?? 0n) + (claimGasAmountEstimate ?? 0n)
        : null,
    gasPrice: updateBalanceGasPrice ?? claimGasPrice ?? null,
    maximumSignificantDigits: SIGNIFICANT_FIGURES.GAS_FEE_TOTAL,
  });

  const gasPrice = updateBalanceGasPrice ?? claimGasPrice;

  const gasHighShowTooltip = !!(
    gasPrice && gasPrice > HANDRAIL_THRESHOLD_DYNAMIC(chainId).GAS_PRICE
  );

  const handleClick = () => {
    setOverrideUnclaimedRewardsAmount(formattedUnclaimedRewardsAmount);
    updateBalanceAndClaimRewards(claimRewardsArgs);
  };

  const isButtonDisabled = skipUpdateBalance
    ? claimRewardsStatus === PROGRESS_STATUS.SUCCESS ||
      claimRewardsStatus === PROGRESS_STATUS.PENDING
    : updateRewardsBalanceStatus === PROGRESS_STATUS.SUCCESS ||
      updateRewardsBalanceStatus === PROGRESS_STATUS.PENDING;

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only trigger on status changes
  useEffect(() => {
    if (claimRewardsStatus === PROGRESS_STATUS.SUCCESS) {
      toast.success(dictionaryDialog('successToast', { tokenAmount: unclaimedRewardsAmount }));
      void refetch();
    } else if (claimRewardsStatus === PROGRESS_STATUS.ERROR) {
      toast.error(claimRewardsErrorMessage);
      setOverrideUnclaimedRewardsAmount(null);
    }
  }, [claimRewardsStatus]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <ActionModuleRow
          label={dictionaryDialog('amountClaimable')}
          tooltip={dictionaryDialog('amountClaimableTooltip')}
        >
          {unclaimedRewardsAmount}
        </ActionModuleRow>
        <ActionModuleFeeAccordionRow
          label={dictionaryFee('networkFee')}
          tooltip={dictionaryFee.rich('networkFeeTooltipWithFormula', {
            link: externalLink(URL.GAS_INFO),
            formula: () => feeFormula,
          })}
          fees={[
            {
              label: dictionaryDialog('updateBalanceCost'),
              fee: feeEstimateUpdate,
              tooltip: feeFormulaUpdate,
            },
            {
              label: dictionaryDialog('claimRewardsCost'),
              fee: feeEstimateClaim,
              tooltip: feeFormulaClaim,
            },
          ]}
          hasMissingEstimatesTooltipContent={dictionaryFee('missingFees')}
          gasHighTooltip={dictionaryFee.rich('gasHigh', { link: externalLink(URL.GAS_INFO) })}
          gasHighShowTooltip={gasHighShowTooltip}
          totalFee={feeEstimate}
        />
      </div>
      <AlertDialogFooter className="mt-4 flex flex-col gap-6 sm:flex-col">
        <Button
          variant="outline"
          rounded="md"
          size="lg"
          aria-label={dictionaryDialog('buttons.submitAria', {
            tokenAmount: unclaimedRewardsAmount,
            gasAmount: feeEstimate ?? 0,
          })}
          className="w-full"
          data-testid={ButtonDataTestId.Claim_Tokens_Submit}
          disabled={isButtonDisabled}
          onClick={handleClick}
        >
          {dictionaryDialog('buttons.submit')}
        </Button>
        {enabled ? (
          <Progress
            steps={[
              {
                text: {
                  [PROGRESS_STATUS.IDLE]: dictionaryStage('balance.idle'),
                  [PROGRESS_STATUS.PENDING]: dictionaryStage('balance.pending'),
                  [PROGRESS_STATUS.SUCCESS]: dictionaryStage('balance.success'),
                  [PROGRESS_STATUS.ERROR]: updateRewardsBalanceErrorMessage,
                },
                status: updateRewardsBalanceStatus,
              },
              {
                text: {
                  [PROGRESS_STATUS.IDLE]: dictionaryStage('claim.idle', {
                    tokenAmount: unclaimedRewardsAmount,
                  }),
                  [PROGRESS_STATUS.PENDING]: dictionaryStage('claim.pending', {
                    tokenAmount: unclaimedRewardsAmount,
                  }),
                  [PROGRESS_STATUS.SUCCESS]: dictionaryStage('claim.success', {
                    tokenAmount: unclaimedRewardsAmount,
                  }),
                  [PROGRESS_STATUS.ERROR]: claimRewardsErrorMessage,
                },
                status: claimRewardsStatus,
              },
            ]}
          />
        ) : null}
      </AlertDialogFooter>
    </>
  );
}
