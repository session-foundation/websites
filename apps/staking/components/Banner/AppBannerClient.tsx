'use client';

import HardForkBanner from '@/components/Banner/HardForkBanner';
import { useIsAppPath } from '@/hooks/useIsAppPath';
import type { ReactNode } from 'react';

export function AppBannerClient({ serverBanners }: { serverBanners: ReactNode }) {
  const isAppPath = useIsAppPath();
  return isAppPath ? (
    <>
      <HardForkBanner />
      {serverBanners}
    </>
  ) : null;
}
