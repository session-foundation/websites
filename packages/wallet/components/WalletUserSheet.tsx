'use client';

import '@web3sheet/ui/styles';

import { networksTab, settingsTab, UserSheet, walletTab } from '@web3sheet/wallet';
import { showTestNetworks } from '@web3sheet/wallet/tabs/settings/testnet';

export default function WalletUserSheet() {
  return (
    <UserSheet
      className="bg-session-black border-session-green rounded-md"
      config={{
        tabs: [
          walletTab({ roundingDecimals: 2 }),
          settingsTab({
            settings: [showTestNetworks],
          }),
          networksTab({}),
        ],
      }}
      walletSheetDisabledViaFeatureFlag={false}
    />
  );
}
