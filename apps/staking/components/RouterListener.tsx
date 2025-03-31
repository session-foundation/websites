'use client';

import logger from '@/lib/logger';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function RouterListener() {
  const pathname = usePathname();

  useEffect(() => {
    logger.debug(`Navigation: ${pathname}`);
  }, [pathname]);

  return null;
}
