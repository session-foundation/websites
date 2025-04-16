'use client';

import WalletButtonWithLocales from '@/components/WalletButtonWithLocales';
import WalletVestingButtonWithLocales from '@/components/WalletVestingButtonWithLocales';
import { useVesting } from '@/providers/vesting-provider';
import type { WalletButtonProps } from '@session/wallet/components/WalletButton';

export default function DynamicWalletButton(props: Partial<WalletButtonProps>) {
  const { activeContract } = useVesting();

  return (
    <>
      {activeContract ? (
        <WalletVestingButtonWithLocales
          activeContract={activeContract}
          className={!activeContract ? 'hidden' : undefined}
          {...props}
        />
      ) : null}
      <WalletButtonWithLocales className={activeContract ? 'hidden' : undefined} {...props} />
    </>
  );
}
