import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { REG_TAB } from '@/app/register/[nodeId]/types';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';
import React from 'react';

export function ReserveSlotsTab() {
  const dictionary = useTranslations('actionModules.registration.reserveSlots');
  const { changeTab } = useRegistrationWizard();

  return (
    <div className="flex w-full flex-col gap-4">
      <Button
        data-testid={ButtonDataTestId.Registration_Reserve_Slots_Skip}
        aria-label={dictionary('buttonSkip.aria')}
        onClick={() => changeTab(REG_TAB.AUTO_ACTIVATE)}
      >
        {dictionary('buttonSkip.text')}
      </Button>
      <Button
        data-testid={ButtonDataTestId.Registration_Reserve_Slots_Reserve}
        aria-label={dictionary('buttonReserve.aria')}
        onClick={() => changeTab(REG_TAB.RESERVE_SLOTS_INPUT)}
      >
        {dictionary('buttonReserve.text')}
      </Button>
    </div>
  );
}
