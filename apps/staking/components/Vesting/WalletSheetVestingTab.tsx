import { VestingHandler } from '@/components/Vesting/VestingHandler';
import {
  type WalletSheetNonPrimaryTabProps,
  type WalletSheetTabDetails,
  useWalletSheetUILibrary,
} from '@session/wallet/components/WalletUserSheet';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';

export type UniqueSettingsTabProps = WalletSheetNonPrimaryTabProps;
type VestingTabProps = UniqueSettingsTabProps;

export function VestingTab({ handleBackButtonClick }: VestingTabProps) {
  const dict = useTranslations('vesting.startDialog');
  const UI = useWalletSheetUILibrary();
  const { setUserSheetOpen } = useWallet();

  return (
    <>
      <UI.SheetHeader className="flex flex-row items-center gap-2 align-middle">
        <UI.BackButton onClick={handleBackButtonClick} />
        <UI.SheetTitle>{dict('title')}</UI.SheetTitle>
      </UI.SheetHeader>
      <UI.SheetDescription>{dict('descriptionSheet')}</UI.SheetDescription>
      <VestingHandler
        onCancelCallback={handleBackButtonClick}
        onSuccessCallback={() => {
          handleBackButtonClick();
          setUserSheetOpen(false);
        }}
        collapseAddress
        hideSkipButton
      />
    </>
  );
}

export const walletSheetVestingTab: WalletSheetTabDetails = {
  id: 'vesting' as WalletSheetTabDetails['id'],
  tab: (props: UniqueSettingsTabProps) => <VestingTab {...props} />,
};
