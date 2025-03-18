import { ClaimRewardsDisabledInfo } from '@/components/ClaimRewardsDisabledInfo';
import { NewTokenContractInfo } from '@/components/NewTokenContractInfo';
import { RegistrationPausedInfo } from '@/components/RegistrationPausedInfo';
import { REMOTE_FEATURE_FLAG } from '@/lib/feature-flags';
import { getRemoteFeatureFlagContent } from '@/lib/feature-flags-server';
import { Banner } from '@session/ui/components/Banner';

export default async function RemoteBanner({
  enabledFlags,
}: {
  enabledFlags: Set<REMOTE_FEATURE_FLAG>;
}) {
  // If the custom banner is enabled, fetch the content of the banner
  const customBanner = enabledFlags.has(REMOTE_FEATURE_FLAG.CUSTOM_BANNER)
    ? ((await getRemoteFeatureFlagContent(REMOTE_FEATURE_FLAG.CUSTOM_BANNER)).content ?? null)
    : null;

  return (
    <>
      {customBanner ? (
        <Banner>
          <span>{customBanner}</span>
        </Banner>
      ) : null}
      {enabledFlags.has(REMOTE_FEATURE_FLAG.NEW_TOKEN_CONTRACT) ? (
        <Banner>
          <NewTokenContractInfo />
        </Banner>
      ) : null}
      {enabledFlags.has(REMOTE_FEATURE_FLAG.DISABLE_CLAIM_REWARDS) ? (
        <Banner>
          <ClaimRewardsDisabledInfo />
        </Banner>
      ) : null}
      {enabledFlags.has(REMOTE_FEATURE_FLAG.DISABLE_NODE_REGISTRATION) ? (
        <Banner>
          <RegistrationPausedInfo />
        </Banner>
      ) : null}
    </>
  );
}
