import type { ClaimDict } from '@/app/mystakes/modules/ClaimTokensModule';
import { ActionModuleRow } from '@/components/ActionModule';
import { ActionModuleFeeAccordionRow } from '@/components/ActionModuleFeeAccordionRow';
import useClaimRewards from '@/hooks/useClaimRewards';
import { useNetworkBalances } from '@/hooks/useNetworkBalances';
import { useNetworkFeeFormula } from '@/hooks/useNetworkFeeFormula';
import { useUnclaimedTokens } from '@/hooks/useUnclaimedTokens';
import {
  DYNAMIC_MODULE,
  HANDRAIL_THRESHOLD_DYNAMIC,
  PREFERENCE,
  SIGNIFICANT_FIGURES,
  URL,
} from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import type { BlsRewardsSignatureResponse } from '@session/staking-api-js/schema';
import { toast } from '@session/ui/lib/toast';
import { PROGRESS_STATUS, Progress } from '@session/ui/motion/progress';
import { AlertDialogFooter } from '@session/ui/ui/alert-dialog';
import { Button } from '@session/ui/ui/button';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { usePreferences } from 'usepref';
import type { Address } from 'viem';

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: This is because of the v1 logic, will be removed once v2 is stable
export function ClaimTokens({
  address,
  claimData,
  dictionary,
  refetchBalance,
}: {
  address: Address;
  claimData: BlsRewardsSignatureResponse;
  dictionary: ClaimDict;
  refetchBalance?: () => void;
}) {
  const dictionaryFee = useTranslations('fee');
  const [overrideFormattedUnclaimed, setOverrideFormattedUnclaimed] = useState<string | null>(null);
  const { chainId } = useWallet();
  const { refetch: refetchV2, unclaimed } = useNetworkBalances({ addressOverride: address });

  const formattedUnclaimedV2 = formatSENTBigInt(unclaimed, DYNAMIC_MODULE.SENT_ROUNDED_DECIMALS);
  // TODO: remove this v1 logic once v2 is stable
  const { getItem } = usePreferences();
  const v2Rewards = !!getItem<boolean>(PREFERENCE.V2_Rewards);
  const { refetch: refetchV1, formattedUnclaimedRewardsAmount: formattedUnclaimedRewardsAmountV1 } =
    useUnclaimedTokens({
      addressOverride: address,
    });

  const formattedUnclaimed = v2Rewards ? formattedUnclaimedV2 : formattedUnclaimedRewardsAmountV1;
  const refetch = v2Rewards ? refetchV2 : refetchV1;

  const unclaimedRewardsAmount = overrideFormattedUnclaimed ?? formattedUnclaimed;

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
    setOverrideFormattedUnclaimed(formattedUnclaimed);
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
      toast.success(dictionary('dialog.successToast', { tokenAmount: unclaimedRewardsAmount }));
      void refetch();
      void refetchBalance?.();
    } else if (claimRewardsStatus === PROGRESS_STATUS.ERROR) {
      toast.error(claimRewardsErrorMessage);
      setOverrideFormattedUnclaimed(null);
    }
  }, [claimRewardsStatus]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <ActionModuleRow
          label={dictionary('dialog.amountClaimable')}
          tooltip={dictionary('dialog.amountClaimableTooltip')}
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
              label: dictionary('dialog.updateBalanceCost'),
              fee: feeEstimateUpdate,
              tooltip: feeFormulaUpdate,
              hasExemption: skipUpdateBalance,
              exemptionReason: dictionary('dialog.updateBalanceCostExemptionReason'),
            },
            {
              label: dictionary('dialog.claimRewardsCost'),
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
          aria-label={dictionary('dialog.buttons.submitAria', {
            tokenAmount: unclaimedRewardsAmount,
            gasAmount: feeEstimate ?? 0,
          })}
          className="w-full"
          data-testid={ButtonDataTestId.Claim_Tokens_Submit}
          disabled={isButtonDisabled}
          onClick={handleClick}
        >
          {dictionary('dialog.buttons.submit')}
        </Button>
        {enabled ? (
          <Progress
            steps={[
              {
                text: {
                  [PROGRESS_STATUS.IDLE]: dictionary('stage.balance.idle'),
                  [PROGRESS_STATUS.PENDING]: dictionary('stage.balance.pending'),
                  [PROGRESS_STATUS.SUCCESS]: dictionary('stage.balance.success'),
                  [PROGRESS_STATUS.ERROR]: updateRewardsBalanceErrorMessage,
                },
                status: skipUpdateBalance ? PROGRESS_STATUS.SUCCESS : updateRewardsBalanceStatus,
              },
              {
                text: {
                  [PROGRESS_STATUS.IDLE]: dictionary('stage.claim.idle', {
                    tokenAmount: unclaimedRewardsAmount,
                  }),
                  [PROGRESS_STATUS.PENDING]: dictionary('stage.claim.pending', {
                    tokenAmount: unclaimedRewardsAmount,
                  }),
                  [PROGRESS_STATUS.SUCCESS]: dictionary('stage.claim.success', {
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
