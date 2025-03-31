'use client';

import { walletSheetVestingTab } from '@/components/Vesting/WalletSheetVestingTab';
import { customSettings } from '@/lib/constants';
import { useVesting } from '@/providers/vesting-provider';
import WalletUserSheetUI from '@session/wallet/components/WalletUserSheet';

export function WalletUserSheet() {
  const { contracts } = useVesting();
  return (
    <WalletUserSheetUI
      customTabs={[walletSheetVestingTab]}
      customSettings={customSettings}
      mainTabConfig={{
        customButtons: contracts.length ? [{ id: 'vesting', label: 'Vesting Contracts' }] : [],
      }}
    />
  );
}
