import type { ClaimDict } from '@/app/mystakes/modules/ClaimTokensModule';
import { ClaimTokens } from '@/app/mystakes/modules/claim/ClaimTokens';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useNetworkBalances } from '@/hooks/useNetworkBalances';
import { useUnclaimedTokens } from '@/hooks/useUnclaimedTokens';
import { PREFERENCE, QUERY } from '@/lib/constants';
import { getRewardsClaimSignature } from '@/lib/queries/getRewardsClaimSignature';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Loading } from '@session/ui/components/loading';
import { usePreferences } from 'usepref';
import type { Address } from 'viem';

export function ClaimTokensDialog({
  address,
  dictionary,
  refetchBalance,
}: { address: Address; dictionary: ClaimDict; refetchBalance?: () => void }) {
  const { canClaim: canClaimV2, refetch: refetchV2 } = useNetworkBalances({
    addressOverride: address,
  });

  // TODO: remove this v1 logic once v2 is stable
  const { getItem } = usePreferences();
  const v2Rewards = !!getItem<boolean>(PREFERENCE.V2_Rewards);
  const { canClaim: canClaimV1, refetch: refetchV1 } = useUnclaimedTokens({
    addressOverride: address,
  });
  const canClaim = v2Rewards ? canClaimV2 : canClaimV1;
  const refetch = v2Rewards ? refetchV2 : refetchV1;

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
