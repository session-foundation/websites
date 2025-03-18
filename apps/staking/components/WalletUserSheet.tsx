'use client';

import { customSettings } from '@/lib/constants';
import WalletUserSheetUI from '@session/wallet/components/WalletUserSheet';

export function WalletUserSheet() {
  return <WalletUserSheetUI customSettings={customSettings} />;
}
