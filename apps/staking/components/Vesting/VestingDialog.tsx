'use client';

import { TransferOwnerDialog } from '@/components/Vesting/TransferOwnerDialog';
import { VestingHandler } from '@/components/Vesting/VestingHandler';
import { VestingInfoDialogContent } from '@/components/Vesting/VestingInfoDialogContent';
import { useVesting } from '@/providers/vesting-provider';
import { useDebounce } from '@session/ui/hooks/useDebounce';
import { AlertDialog, AlertDialogContent } from '@session/ui/ui/alert-dialog';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const VESTING_HANDLER_DELAY = 400;

export function VestingDialog() {
  const dict = useTranslations('vesting.startDialog');
  const dictInfo = useTranslations('vesting.infoDialog');
  const dictTransferBeneficiary = useTranslations('vesting.transferBeneficiaryDialog');
  const [forceShowVestingHandler, setForceShowVestingHandler] = useState(false);
  const { showVestingSelectionDialog, setShowVestingSelectionDialog, refetch } = useVesting();
  const [backButtonActive, setBackButtonActive] = useState(false);
  const [isEditingBeneficiary, setIsEditingBeneficiary] = useState(false);

  const { activeContract, disconnectFromVestingContract } = useVesting();

  const onSuccessCallback = () => {
    setShowVestingSelectionDialog(false);
    setForceShowVestingHandler(false);
  };

  const onCancelCallback = () => {
    disconnectFromVestingContract();
    setForceShowVestingHandler(false);
  };

  const switchButtonCallback = () => {
    setForceShowVestingHandler(true);
    setBackButtonActive(false);
  };

  const onBackButtonClick = () => {
    setBackButtonActive(true);
    setForceShowVestingHandler(false);
    setIsEditingBeneficiary(false);
  };

  const onCloseClick = () => {
    setShowVestingSelectionDialog(false);
    setForceShowVestingHandler(false);
  };

  const onEditBeneficiaryButtonClick = () => {
    setIsEditingBeneficiary(true);
  };

  const OnOwnerTransferSuccessCallback = () => {
    onBackButtonClick();
    onCloseClick();
    disconnectFromVestingContract();
    refetch();
  };

  /** Only debounced when the forceShowVestingHandler being set to false, this delays this
   *  value changing back to false, fixing an issue where the state change is visible
   *  before the dialog's closing transition is complete */
  const showVestingHandlerDebounced = useDebounce(
    forceShowVestingHandler || !activeContract,
    forceShowVestingHandler ? 0 : VESTING_HANDLER_DELAY
  );

  const showVestingHandler = !backButtonActive && showVestingHandlerDebounced;
  const hasActiveContractDebounced = useDebounce(activeContract !== null, 100);

  useEffect(() => {
    if (showVestingSelectionDialog) {
      setBackButtonActive(false);
      setIsEditingBeneficiary(false);
    }
  }, [showVestingSelectionDialog]);

  return (
    <AlertDialog open={showVestingSelectionDialog}>
      <AlertDialogContent
        hideCloseButton={!hasActiveContractDebounced}
        showBackButton={(showVestingHandler || isEditingBeneficiary) && hasActiveContractDebounced}
        onCloseClick={onCloseClick}
        onBackButtonClick={onBackButtonClick}
        dialogTitle={
          isEditingBeneficiary
            ? dictTransferBeneficiary('title')
            : showVestingHandler
              ? dict('title')
              : dictInfo('title')
        }
        dialogDescription={
          showVestingHandler && !hasActiveContractDebounced ? dict('description') : null
        }
      >
        {showVestingHandler ? (
          <VestingHandler
            onSuccessCallback={onSuccessCallback}
            onCancelCallback={onCancelCallback}
            hideSkipButton={hasActiveContractDebounced}
          />
        ) : isEditingBeneficiary ? (
          <TransferOwnerDialog onSuccessCallback={OnOwnerTransferSuccessCallback} />
        ) : (
          <VestingInfoDialogContent
            switchButtonCallback={switchButtonCallback}
            disconnectButtonCallback={onCancelCallback}
            editBeneficiaryButtonCallback={onEditBeneficiaryButtonClick}
          />
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
