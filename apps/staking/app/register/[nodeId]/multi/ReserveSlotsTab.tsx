import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { REG_TAB } from '@/app/register/[nodeId]/types';
import { REMOTE_FEATURE_FLAG } from '@/lib/feature-flags';
import { useRemoteFeatureFlagQuery } from '@/lib/feature-flags-client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Button } from '@session/ui/ui/button';
import { Tooltip } from '@session/ui/ui/tooltip';
import { useTranslations } from 'next-intl';

export function ReserveSlotsTab() {
  const { changeTab } = useRegistrationWizard();
  const dict = useTranslations('actionModules.registration.reserveSlots');
  const { enabled: isReservedSlotsDisabled } = useRemoteFeatureFlagQuery(
    REMOTE_FEATURE_FLAG.DISABLE_NODE_REGISTRATION_RESERVED
  );

  const reserveButton = (
    <Button
      data-testid={ButtonDataTestId.Registration_Reserve_Slots_Reserve}
      aria-label={dict('buttonReserve.aria')}
      onClick={() => changeTab(REG_TAB.RESERVE_SLOTS_INPUT)}
      disabled={isReservedSlotsDisabled}
      className="w-full"
    >
      {dict('buttonReserve.text')}
    </Button>
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <Button
        data-testid={ButtonDataTestId.Registration_Reserve_Slots_Skip}
        aria-label={dict('buttonSkip.aria')}
        onClick={() => changeTab(REG_TAB.AUTO_ACTIVATE)}
      >
        {dict('buttonSkip.text')}
      </Button>
      {isReservedSlotsDisabled ? (
        <Tooltip tooltipContent={dict('buttonReserve.disabledTooltip')}>
          <div className="w-full">{reserveButton}</div>
        </Tooltip>
      ) : (
        reserveButton
      )}
    </div>
  );
}
