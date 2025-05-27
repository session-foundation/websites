'use client';

import { DropdownHamburgerMenu } from '@/components/DropdownHamburgerMenu';
import WalletButtonWithLocales from '@/components/WalletButtonWithLocales';
import { NEXT_PUBLIC_BRANDED } from '@/lib/env';
import { cn } from '@session/ui/lib/utils';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

const DynamicWalletButton = dynamic(() => import('./WalletButtonWithLocales'), {
  ssr: false,
  loading: () => <WalletButtonWithLocales />,
});

export default function HeaderClient({ children }: { children?: ReactNode }) {
  return (
    <>
      <div className={cn('flex flex-row gap-8 pr-4')}>{children}</div>
      <div className="flex flex-row justify-end gap-3">
        <DynamicWalletButton />
        {NEXT_PUBLIC_BRANDED ? <DropdownHamburgerMenu /> : null}
      </div>
    </>
  );
}
