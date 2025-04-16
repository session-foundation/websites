import { isProduction } from '@/lib/env';
import { FEATURE_FLAG } from '@/lib/feature-flags';
import { useFeatureFlag } from '@/lib/feature-flags-client';
import { getTestingError, getTestingErrorLong } from '@session/testing/errors';

/**
 * The hook is a no-op in production. The hook will throw an error if any of the following flags are true:
 * - {@link FEATURE_FLAG.THROW_TESTING_ERROR}
 * - {@link FEATURE_FLAG.THROW_TESTING_ERROR_LONG}
 */
export const useAllowTestingErrorToThrow = () => {
  if (isProduction) return;
  // biome-ignore lint/correctness/useHookAtTopLevel: isProduction is a constant
  const throwLongTestingError = useFeatureFlag(FEATURE_FLAG.THROW_TESTING_ERROR_LONG);
  // biome-ignore lint/correctness/useHookAtTopLevel: isProduction is a constant
  const throwTestingError = useFeatureFlag(FEATURE_FLAG.THROW_TESTING_ERROR);
  if (throwLongTestingError) throw getTestingErrorLong();
  if (throwTestingError) throw getTestingError();
};
