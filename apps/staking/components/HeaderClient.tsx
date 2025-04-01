'use client';

import { DropdownHamburgerMenu } from '@/components/DropdownHamburgerMenu';
import DynamicHeaderNavLinks from '@/components/DynamicHeaderNavLinks';
import WalletButtonWithLocales from '@/components/WalletButtonWithLocales';
import { WalletNetworkDropdownWithLocales } from '@/components/WalletNetworkDropdownWithLocales';
import { cn } from '@session/ui/lib/utils';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

// TODO: implement dynamic imports for these hydration issue components and build skeletons for them
// const DynamicHeaderNavLinks = dynamic(() => import('./DynamicHeaderNavLinks'), { ssr: false, loading: () => <LoadingText /> })
const DynamicWalletButton = dynamic(() => import('./DynamicWalletButton'), {
  ssr: false,
  loading: () => <WalletButtonWithLocales />,
});

export default function HeaderClient({ children }: { children?: ReactNode }) {
  return (
    <>
      <div className={cn('flex flex-row gap-8 pr-4')}>
        {children}
        <DynamicHeaderNavLinks />
      </div>
      <div className="flex flex-row justify-end gap-3">
        <DynamicWalletButton />
        <WalletNetworkDropdownWithLocales className="hidden lg:flex" />
        <DropdownHamburgerMenu />
      </div>
    </>
  );
}
