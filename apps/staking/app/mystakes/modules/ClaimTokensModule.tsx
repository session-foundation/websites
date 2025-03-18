'use client';

import { ActionModuleRow } from '@/components/ActionModule';
import { ActionModuleFeeAccordionRow } from '@/components/ActionModuleFeeAccordionRow';
import { ErrorMessage } from '@/components/ErrorMessage';
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
import { ButtonModule, ModuleContent, ModuleText } from '@session/ui/components/Module';
import { Loading } from '@session/ui/components/loading';
import { PROGRESS_STATUS, Progress } from '@session/ui/components/motion/progress';
import { PresentIcon } from '@session/ui/icons/PresentIcon';
import { toast } from '@session/ui/lib/toast';
import { cn } from '@session/ui/lib/utils';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from '@session/ui/ui/alert-dialog';
import { Button } from '@session/ui/ui/button';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';

export default function ClaimTokensModule() {
  const { address } = useWallet();
  const dictionary = useTranslations('modules.claim');
  const { canClaim, unclaimedRewards } = useUnclaimedTokens();
  const { enabled: isClaimRewardsDisabled, isLoading: isRemoteFlagLoading } =
    useRemoteFeatureFlagQuery(REMOTE_FEATURE_FLAG.DISABLE_CLAIM_REWARDS);

  const isDisabled =
    !(address && canClaim && unclaimedRewards) || isRemoteFlagLoading || isClaimRewardsDisabled;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <ButtonModule
          data-testid={ButtonDataTestId.Claim_Tokens_Open_Dialog}
          className="group items-center transition-all duration-300 motion-reduce:transition-none"
          disabled={isDisabled}
        >
          <ModuleContent className="flex h-full select-none flex-row items-center gap-2 p-0 py-3 align-middle font-bold">
            <ModuleText
              className={cn(
                'inline-flex items-center gap-1.5 align-middle text-3xl transition-all duration-300 motion-reduce:transition-none',
                isDisabled
                  ? 'opacity-50'
                  : 'text-session-green transition-all duration-300 group-hover:text-session-black motion-reduce:transition-none'
              )}
            >
              <PresentIcon
                className={cn(
                  'mb-1 h-7 w-7 transition-all duration-300 motion-reduce:transition-none',
                  isDisabled
                    ? 'fill-session-text opacity-50'
                    : 'fill-session-green group-hover:fill-session-black'
                )}
              />
              {dictionary('title')}
            </ModuleText>
          </ModuleContent>
        </ButtonModule>
      </AlertDialogTrigger>
      <AlertDialogContent dialogTitle={dictionary('title')}>
        <ClaimTokensDialog />
      </AlertDialogContent>
    </AlertDialog>
  );
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO: simplify this component
function ClaimTokensDialog() {
  const dictionary = useTranslations('modules.claim');
  const dictionaryFee = useTranslations('fee');
  const dictionaryDialog = useTranslations('modules.claim.dialog');
  const dictionaryStage = useTranslations('modules.claim.stage');

  const { address, chainId } = useWallet();
  const { canClaim, refetch, formattedUnclaimedRewardsAmount } = useUnclaimedTokens();

  const {
    data: rewardsClaimData,
    isError,
    isSuccess,
  } = useStakingBackendQueryWithParams(
    getRewardsClaimSignature,
    { address: address! },
    {
      enabled: !!address && canClaim,
      staleTime: QUERY.STALE_TIME_CLAIM_REWARDS,
    }
  );

  const [rewards, blsSignature, excludedSigners] = useMemo(() => {
    if (!rewardsClaimData || !('rewards' in rewardsClaimData) || !rewardsClaimData.rewards) {
      return [undefined, undefined, undefined];
    }
    const { amount, signature, non_signer_indices } = rewardsClaimData.rewards;

    return [BigInt(amount), signature, non_signer_indices.map(BigInt)];
  }, [rewardsClaimData]);

  const claimRewardsArgs = useMemo(
    () => ({
      address,
      rewards,
      blsSignature,
      excludedSigners,
    }),
    [address, rewards, blsSignature, excludedSigners]
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
    updateBalanceAndClaimRewards();
  };

  const isDisabled = !(address && rewards && blsSignature);

  const isButtonDisabled =
    isDisabled ||
    (skipUpdateBalance
      ? claimRewardsStatus === PROGRESS_STATUS.SUCCESS ||
        claimRewardsStatus === PROGRESS_STATUS.PENDING
      : updateRewardsBalanceStatus === PROGRESS_STATUS.SUCCESS ||
        updateRewardsBalanceStatus === PROGRESS_STATUS.PENDING);

  // biome-ignore lint/correctness/useExhaustiveDependencies: On mount
  useEffect(() => {
    if (claimRewardsStatus === PROGRESS_STATUS.SUCCESS) {
      toast.success(
        dictionaryDialog('successToast', { tokenAmount: formattedUnclaimedRewardsAmount })
      );
      void refetch();
    }
  }, [claimRewardsStatus]);

  return (
    <>
      {isError ? (
        <ErrorMessage
          refetch={refetch}
          message={dictionary.rich('error')}
          buttonText={dictionary('errorButton')}
          buttonDataTestId={ButtonDataTestId.Claim_Tokens_Error_Retry}
        />
      ) : isSuccess ? (
        <>
          <div className="flex flex-col gap-4">
            <ActionModuleRow
              label={dictionaryDialog('amountClaimable')}
              tooltip={dictionaryDialog('amountClaimableTooltip')}
            >
              {formattedUnclaimedRewardsAmount}
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
                tokenAmount: formattedUnclaimedRewardsAmount,
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
                        tokenAmount: formattedUnclaimedRewardsAmount,
                      }),
                      [PROGRESS_STATUS.PENDING]: dictionaryStage('claim.pending', {
                        tokenAmount: formattedUnclaimedRewardsAmount,
                      }),
                      [PROGRESS_STATUS.SUCCESS]: dictionaryStage('claim.success', {
                        tokenAmount: formattedUnclaimedRewardsAmount,
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
      ) : (
        <Loading />
      )}
    </>
  );
}
