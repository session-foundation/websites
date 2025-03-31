import { VestingInfo } from '@/components/Vesting/VestingInfo';
import { useVesting } from '@/providers/vesting-provider';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';

export type VestingInfoDialogContentProps = {
  switchButtonCallback?: () => void;
  disconnectButtonCallback?: () => void;
  editBeneficiaryButtonCallback?: () => void;
};

export function VestingInfoDialogContent({
  switchButtonCallback,
  disconnectButtonCallback,
  editBeneficiaryButtonCallback,
}: VestingInfoDialogContentProps) {
  const dict = useTranslations('vesting.infoDialog');
  const { contracts } = useVesting();

  return (
    <>
      <VestingInfo editBeneficiaryButtonCallback={editBeneficiaryButtonCallback} />
      <div className="flex w-full flex-col gap-4">
        {contracts.length > 1 ? (
          <Button
            className="w-full uppercase"
            data-testid={ButtonDataTestId.Vesting_Info_Switch}
            aria-label={dict('switchButton.aria')}
            onClick={switchButtonCallback}
            variant="outline"
          >
            {dict('switchButton.label')}
          </Button>
        ) : null}
        <Button
          className="w-full uppercase"
          data-testid={ButtonDataTestId.Vesting_Disconnect}
          aria-label={dict('disconnectButton.aria')}
          onClick={disconnectButtonCallback}
          variant="destructive-outline"
        >
          {dict('disconnectButton.label')}
        </Button>
      </div>
    </>
  );
}
