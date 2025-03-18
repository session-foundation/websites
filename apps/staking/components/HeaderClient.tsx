'use client';

import { DropdownHamburgerMenu } from '@/components/DropdownHamburgerMenu';
import { WalletButtonWithLocales } from '@/components/WalletButtonWithLocales';
import { WalletNetworkDropdownWithLocales } from '@/components/WalletNetworkDropdownWithLocales';

export default function HeaderClient() {
  return (
    <div className="flex flex-row justify-end gap-3">
      <WalletButtonWithLocales />
      <WalletNetworkDropdownWithLocales className="hidden lg:flex" />
      <DropdownHamburgerMenu />
    </div>
  );
}
