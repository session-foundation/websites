import Maintenance from '@/components/Maintenance';
import { REMOTE_FEATURE_FLAG } from '@/lib/feature-flags';
import { getRemoteFeatureFlag } from '@/lib/feature-flags-server';
import type { ReactNode } from 'react';

export default async function ScreenContainer({ children }: { children: ReactNode }) {
  const { enabled: isAppMaintenanceModeEnabled } = await getRemoteFeatureFlag(
    REMOTE_FEATURE_FLAG.ENABLE_APP_MAINTENANCE_MODE
  );

  if (isAppMaintenanceModeEnabled) {
    return <Maintenance />;
  }

  return <div className="-mt-header-displacement h-dvh pt-header-displacement">{children}</div>;
}
