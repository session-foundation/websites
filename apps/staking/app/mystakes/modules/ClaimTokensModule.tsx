'use client';

import { ButtonModule, ModuleContent, ModuleText } from '@session/ui/components/Module';
import { PresentIcon } from '@session/ui/icons/PresentIcon';
import { cn } from '@session/ui/lib/utils';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from '@session/ui/ui/alert-dialog';
import { useTranslations } from 'next-intl';
import { ActionModuleRow } from '@/components/ActionModule';
import { Button } from '@session/ui/ui/button';
import { formatBigIntTokenValue } from '@session/util-crypto/maths';
import { ETH_DECIMALS } from '@session/wallet/lib/eth';
import { LoadingText } from '@session/ui/components/loading-text';
import { QUERY, TICKER, URL } from '@/lib/constants';
import useClaimRewards from '@/hooks/useClaimRewards';
import { useEffect, useMemo } from 'react';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { externalLink } from '@/lib/locale-defaults';
import { AlertTooltip } from '@session/ui/ui/tooltip';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { getRewardsClaimSignature } from '@/lib/queries/getRewardsClaimSignature';
import { Loading } from '@session/ui/components/loading';
import { useRemoteFeatureFlagQuery } from '@/lib/feature-flags-client';
import { REMOTE_FEATURE_FLAG } from '@/lib/feature-flags';
import { toast } from '@session/ui/lib/toast';
import { Progress, PROGRESS_STATUS } from '@session/ui/components/motion/progress';
import { TriangleAlertIcon } from '@session/ui/icons/TriangleAlertIcon';
import { useUnclaimedTokens } from '@/hooks/useUnclaimedTokens';

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
                  : 'text-session-green group-hover:text-session-black transition-all duration-300 motion-reduce:transition-none'
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

function ErrorMessage({ refetch }: { refetch: () => void }) {
  const dictionary = useTranslations('modules.claim');
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <TriangleAlertIcon className="stroke-warning h-16 w-16" />
      <p>{dictionary.rich('error')}</p>
      <Button
        data-testid={ButtonDataTestId.Claim_Tokens_Error_Retry}
        rounded="md"
        size="lg"
        onClick={refetch}
      >
        {dictionary('errorButton')}
      </Button>
    </div>
  );
}

function ClaimTokensDialog() {
  const dictionary = useTranslations('modules.claim.dialog');
  const dictionaryStage = useTranslations('modules.claim.stage');

  const { address } = useWallet();
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
    updateBalanceFee,
    estimateFee,
    updateRewardsBalanceStatus,
    claimRewardsStatus,
    enabled,
    skipUpdateBalance,
    updateRewardsBalanceErrorMessage,
    claimRewardsErrorMessage,
  } = useClaimRewards(claimRewardsArgs);

  const feeEstimate = useMemo(
    () =>
      updateBalanceFee !== null || claimFee !== null
        ? formatBigIntTokenValue(
            (updateBalanceFee ?? BigInt(0)) + (claimFee ?? BigInt(0)),
            ETH_DECIMALS,
            18
          )
        : null,
    [updateBalanceFee, claimFee]
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

  useEffect(() => {
    if (!isDisabled) {
      estimateFee();
    }
  }, [address, rewards, blsSignature]);

  useEffect(() => {
    if (claimRewardsStatus === PROGRESS_STATUS.SUCCESS) {
      toast.success(dictionary('successToast', { tokenAmount: formattedUnclaimedRewardsAmount }));
      void refetch();
    }
  }, [claimRewardsStatus]);

  return (
    <>
      {isError ? (
        <ErrorMessage refetch={refetch} />
      ) : isSuccess ? (
        <>
          <div className="flex flex-col gap-4">
            <ActionModuleRow
              label={dictionary('claimFee')}
              tooltip={dictionary.rich('claimFeeTooltip', {
                link: externalLink(URL.GAS_INFO),
              })}
            >
              <span className="inline-flex flex-row items-center gap-1.5 align-middle">
                {feeEstimate && !updateBalanceFee ? (
                  <AlertTooltip tooltipContent={dictionary('alert.gasFetchFailedUpdateBalance')} />
                ) : null}
                {feeEstimate && !claimFee ? (
                  <AlertTooltip tooltipContent={dictionary('alert.gasFetchFailedClaimRewards')} />
                ) : null}
                {feeEstimate ? (
                  `${feeEstimate} ${TICKER.ETH}`
                ) : (
                  <LoadingText className="mr-8 scale-x-75 scale-y-50" />
                )}
              </span>
            </ActionModuleRow>
            <ActionModuleRow
              label={dictionary('amountClaimable')}
              tooltip={dictionary('amountClaimableTooltip')}
            >
              {formattedUnclaimedRewardsAmount}
            </ActionModuleRow>
          </div>
          <AlertDialogFooter className="mt-4 flex flex-col gap-6 sm:flex-col">
            <Button
              variant="outline"
              rounded="md"
              size="lg"
              aria-label={dictionary('buttons.submitAria', {
                tokenAmount: formattedUnclaimedRewardsAmount,
                gasAmount: feeEstimate ?? 0,
              })}
              className="w-full"
              data-testid={ButtonDataTestId.Claim_Tokens_Submit}
              disabled={isButtonDisabled}
              onClick={handleClick}
            >
              {dictionary('buttons.submit', { tokenAmount: formattedUnclaimedRewardsAmount })}
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
