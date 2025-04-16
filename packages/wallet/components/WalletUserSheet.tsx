'use client';

import '@web3sheet/ui/styles';

import { ReactPortal } from '@session/ui/components/util/ReactPortal';
import { cn } from '@session/ui/lib/utils';
import { useUiLibrary } from '@web3sheet/core';
import {
  type NonPrimaryTabProps,
  type TabDetails,
  UserSheet,
  networksTab,
  settingsTab,
  walletTab,
} from '@web3sheet/wallet';

export default function WalletUserSheet({
  customTabs,
  customSettings,
  mainTabConfig,
}: {
  customTabs?: Array<TabDetails>;
  customSettings?: Array<WalletSheetSettingDetails>;
  mainTabConfig?: WalletSheetMainTabConfig;
}) {
  return (
    <ReactPortal>
      <UserSheet
        className={cn('z-[99999999] rounded-md border-session-green bg-session-black')}
        config={{
          mainTabConfig,
          customTabs: customTabs ?? [],
          tabs: [
            walletTab({ roundingDecimals: 2 }),
            settingsTab({
              settings: [...(customSettings ?? [])],
            }),
            networksTab({}),
          ],
        }}
        walletSheetDisabledViaFeatureFlag={false}
      />
    </ReactPortal>
  );
}

export type WalletSheetMainTabConfig = Parameters<typeof UserSheet>[0]['config']['mainTabConfig'];
export type WalletSheetSettingDetails = Parameters<typeof settingsTab>[0]['settings'][number];
export type WalletSheetTabDetails = TabDetails;
export type WalletSheetNonPrimaryTabProps = NonPrimaryTabProps;
export const useWalletSheetUILibrary = useUiLibrary;
