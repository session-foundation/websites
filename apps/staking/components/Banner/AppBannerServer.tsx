import { AppBannerClient } from '@/components/Banner/AppBannerClient';
import RemoteBanner from '@/components/Banner/RemoteBanner';
import TestnetBanner from '@/components/Banner/TestnetBanner';
import { NEXT_PUBLIC_TESTNET } from '@/lib/env';
import type { REMOTE_FEATURE_FLAG } from '@/lib/feature-flags';

export function AppBannerServer({
  enabledFlags,
}: {
  enabledFlags: Set<REMOTE_FEATURE_FLAG>;
}) {
  return (
    <AppBannerClient
      serverBanners={
        <>
          {NEXT_PUBLIC_TESTNET ? <TestnetBanner /> : null}
          <RemoteBanner enabledFlags={enabledFlags} />
        </>
      }
    />
  );
}
