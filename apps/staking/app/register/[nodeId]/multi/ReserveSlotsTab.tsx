import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { REG_TAB } from '@/app/register/[nodeId]/types';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';
import React from 'react';

export function ReserveSlotsTab() {
  const { changeTab } = useRegistrationWizard();
  const dict = useTranslations('actionModules.registration.reserveSlots');

  return (
    <div className="flex w-full flex-col gap-4">
      <Button
        data-testid={ButtonDataTestId.Registration_Reserve_Slots_Skip}
        aria-label={dict('buttonSkip.aria')}
        onClick={() => changeTab(REG_TAB.AUTO_ACTIVATE)}
      >
        {dict('buttonSkip.text')}
      </Button>
      <Button
        data-testid={ButtonDataTestId.Registration_Reserve_Slots_Reserve}
        aria-label={dict('buttonReserve.aria')}
        onClick={() => changeTab(REG_TAB.RESERVE_SLOTS_INPUT)}
      >
        {dict('buttonReserve.text')}
      </Button>
    </div>
  );
}
