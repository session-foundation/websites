'use client';

import { useVesting } from '@/providers/vesting-provider';
import { ButtonDataTestId, SwitchDataTestId } from '@/testing/data-test-ids';
import type { VestingContract } from '@session/staking-api-js/schema';
import { DocumentIcon } from '@session/ui/icons/DocumentIcon';
import { Avatar } from '@session/ui/ui/avatar';
import { Button } from '@session/ui/ui/button';
import { Switch } from '@session/ui/ui/switch';
import { collapseString } from '@session/util-crypto/string';
import type { WalletButtonProps } from '@session/wallet/components/WalletButton';
import { useTranslations } from 'next-intl';

export type WalletVestingButtonWithLocalesProps = Partial<WalletButtonProps> & {
  activeContract: VestingContract;
};

export default function WalletVestingButtonWithLocales({
  activeContract,
  ...props
}: WalletVestingButtonWithLocalesProps) {
  const { setShowVestingSelectionDialog, disconnectFromVestingContract } = useVesting();

  const dictVestingSwitch = useTranslations('vesting.headerSwitch');

  return (
    <>
      <div className="my-auto hidden flex-row items-center gap-2 align-middle md:flex">
        <label htmlFor={SwitchDataTestId.Vesting_Switch} className="text-sm">
          {dictVestingSwitch('label')}
        </label>
        <Switch
          id={SwitchDataTestId.Vesting_Switch}
          defaultChecked={true}
          onCheckedChange={disconnectFromVestingContract}
          aria-label={dictVestingSwitch('aria')}
          title={dictVestingSwitch('aria')}
        />
      </div>
      <Button
        {...props}
        onClick={() => setShowVestingSelectionDialog(true)}
        data-testid={ButtonDataTestId.Vesting_Wallet_Button}
      >
        <Avatar className="me-1 h-4 w-4">
          <DocumentIcon className="h-4 w-4" />
        </Avatar>
        {collapseString(activeContract.address, 7, 7)}
      </Button>
    </>
  );
}
