'use client';

import { ClaimTokensDialog } from '@/app/mystakes/modules/claim/ClaimTokensDialog';
import type { AddressModuleProps } from '@/app/mystakes/modules/types';
import ModuleButtonDialogTrigger from '@/components/ModuleButtonDialogTrigger';
import { useUnclaimedTokens } from '@/hooks/useUnclaimedTokens';
import { REMOTE_FEATURE_FLAG } from '@/lib/feature-flags';
import { useRemoteFeatureFlagQuery } from '@/lib/feature-flags-client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import type { PresentIcon } from '@session/ui/icons/PresentIcon';
import { useWalletTokenBalance } from '@session/wallet/components/WalletButton';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';

export type ClaimDict = ReturnType<typeof useTranslations<'modules.claim'>>;

export type ClaimTokensModuleProps = AddressModuleProps & {
  dictionary?: ClaimDict;
  textClassName?: string;
  iconOverride?: typeof PresentIcon;
  iconStrokeForFill?: boolean;
  refetchBalance?: () => void;
};

export default function ClaimTokensModule({
  addressOverride,
  dictionary,
  iconOverride,
  iconStrokeForFill,
  textClassName,
  refetchBalance,
}: ClaimTokensModuleProps) {
  const { address: connectedAddress } = useWallet();
  const { refetch } = useWalletTokenBalance();
  const fallbackDict = useTranslations('modules.claim');
  const dict = dictionary ?? fallbackDict;
  const { canClaim, unclaimedRewards } = useUnclaimedTokens({ addressOverride });
  const { enabled: isClaimRewardsDisabled, isLoading: isRemoteFlagLoading } =
    useRemoteFeatureFlagQuery(REMOTE_FEATURE_FLAG.DISABLE_CLAIM_REWARDS);

  const address = addressOverride ?? connectedAddress;

  return (
    <ModuleButtonDialogTrigger
      dialogContent={
        address ? (
          <ClaimTokensDialog
            address={address}
            dictionary={dict}
            refetchBalance={refetchBalance ?? refetch}
          />
        ) : null
      }
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
