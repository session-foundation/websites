'use client';

import '@web3sheet/ui/styles';

import {
  networksTab,
  type NonPrimaryTabProps,
  settingsTab,
  type TabDetails,
  UserSheet,
  walletTab,
} from '@web3sheet/wallet';
import { useUiLibrary } from '@web3sheet/core';
import { ReactPortal } from '@session/ui/components/util/ReactPortal';
import { cn } from '@session/ui/lib/utils';

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
        className={cn('bg-session-black border-session-green z-[99999999] rounded-md')}
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
