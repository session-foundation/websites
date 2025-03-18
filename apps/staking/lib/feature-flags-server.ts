import 'server-only';

import type { REMOTE_FEATURE_FLAG } from '@/lib/feature-flags';
import {
  getRemoteFeatureFlagContentGeneric,
  getRemoteFeatureFlagGeneric,
  getRemoteFeatureFlagsGeneric,
} from '@session/feature-flags/remote';

export const getRemoteFeatureFlag = getRemoteFeatureFlagGeneric<REMOTE_FEATURE_FLAG>;
export const getRemoteFeatureFlags = getRemoteFeatureFlagsGeneric<REMOTE_FEATURE_FLAG>;
export const getRemoteFeatureFlagContent = getRemoteFeatureFlagContentGeneric<REMOTE_FEATURE_FLAG>;
