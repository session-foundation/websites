import type { ClaimDict } from '@/app/mystakes/modules/ClaimTokensModule';
import { ClaimTokens } from '@/app/mystakes/modules/claim/ClaimTokens';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useNetworkBalances } from '@/hooks/useNetworkBalances';
import { QUERY } from '@/lib/constants';
import { getRewardsClaimSignature } from '@/lib/queries/getRewardsClaimSignature';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Loading } from '@session/ui/components/loading';
import type { Address } from 'viem';

export function ClaimTokensDialog({
  address,
  dictionary,
  refetchBalance,
}: { address: Address; dictionary: ClaimDict; refetchBalance?: () => void }) {
  const { canClaim, refetch } = useNetworkBalances({ addressOverride: address });

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
        <ClaimTokens
          claimData={claimData}
          address={address}
          dictionary={dictionary}
          refetchBalance={refetchBalance}
        />
      ) : (
        <Loading />
      )}
    </>
  );
}
