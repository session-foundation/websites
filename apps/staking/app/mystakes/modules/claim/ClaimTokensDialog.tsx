import type { ClaimDict } from '@/app/mystakes/modules/ClaimTokensModule';
import { ClaimTokens } from '@/app/mystakes/modules/claim/ClaimTokens';
import { ClaimTokensOverLimit } from '@/app/mystakes/modules/claim/ClaimTokensOverLimit';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useNetworkBalances } from '@/hooks/useNetworkBalances';
import { QUERY } from '@/lib/constants';
import { getRewardsClaimSignature } from '@/lib/queries/getRewardsClaimSignature';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { PROGRESS_STATUS, Progress } from '@session/ui/motion/progress';
import { useMount } from '@session/util-react/hooks/useMount';
import { useState } from 'react';
import type { Address } from 'viem';

export function ClaimTokensDialog({
  address,
  dictionary,
  refetchBalance,
}: { address: Address; dictionary: ClaimDict; refetchBalance?: () => void }) {
  const { canClaim, isClaimOverLimit, refetch } = useNetworkBalances({ addressOverride: address });

  const { data: claimData, isError } = useStakingBackendQueryWithParams(
    getRewardsClaimSignature,
    { address },
    {
      enabled: !!address && canClaim && !isClaimOverLimit,
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
        <ClaimTokens
          claimData={claimData}
          address={address}
          dictionary={dictionary}
          refetchBalance={refetchBalance}
        />
      ) : isClaimOverLimit ? (
        <ClaimTokensOverLimit address={address} />
      ) : (
        <ClaimLoading />
      )}
    </>
  );
}

// TODO: make this its own component once we have more intelligent data on step progress
const estimatedTimeSeconds = 8;
const steps = 4;
const timePerStep = Math.ceil((estimatedTimeSeconds / steps) * 1000);

const makeText = (text: string) => ({
  [PROGRESS_STATUS.IDLE]: text,
  [PROGRESS_STATUS.PENDING]: text,
  [PROGRESS_STATUS.SUCCESS]: text,
  [PROGRESS_STATUS.ERROR]: text,
});

function parseStatus(step: number, currentStep: number) {
  if (currentStep > step) {
    return PROGRESS_STATUS.SUCCESS;
  }
  if (currentStep === step) {
    return PROGRESS_STATUS.PENDING;
  }
  return PROGRESS_STATUS.IDLE;
}

function ClaimLoading() {
  const [step, setStep] = useState<number>(0);

  useMount(() => {
    const id = setInterval(() => setStep((p) => p + 1), timePerStep);
    return () => clearInterval(id);
  });

  return (
    <div className="flex h-full min-h-40 w-full flex-col items-center align-middle">
      <Progress
        steps={[
          {
            status: parseStatus(0, step),
            text: makeText('Checking Arbitrum Claim Status'),
          },
          {
            status: parseStatus(1, step),
            text: makeText('Requesting Claim Signature'),
          },
          {
            status: parseStatus(2, step),
            text: makeText('Waiting for Network Signature'),
          },
          {
            status: step < 3 ? parseStatus(3, step) : PROGRESS_STATUS.PENDING,
            text: makeText('Preparing Claim Transaction'),
          },
        ]}
      />
    </div>
  );
}
