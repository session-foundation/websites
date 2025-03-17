'use client';

import WalletUserSheetUI from '@session/wallet/components/WalletUserSheet';
import { customSettings } from '@/lib/constants';

export function WalletUserSheet() {
  return <WalletUserSheetUI customSettings={customSettings} />;
}
