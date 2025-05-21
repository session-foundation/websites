'use client';

import NoticeModule from '@/app/mystakes/modules/NoticeModule';
import PriceModule from '@/app/mystakes/modules/PriceModule';
import { REMOTE_FEATURE_FLAG } from '@/lib/feature-flags';
import { useRemoteFeatureFlagQuery } from '@/lib/feature-flags-client';

export default function BottomModule() {
  const { enabled, isLoading } = useRemoteFeatureFlagQuery(
    REMOTE_FEATURE_FLAG.DISABLE_PRICE_MODULE
  );
  return isLoading ? null : enabled ? <NoticeModule /> : <PriceModule />;
}
