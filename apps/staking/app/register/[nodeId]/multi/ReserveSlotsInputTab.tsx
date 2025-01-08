import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { REG_TAB } from '@/app/register/[nodeId]/types';
import type { ReservedContributorStruct } from '@/hooks/useCreateOpenNodeRegistration';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';
import React from 'react';
import { isAddress } from 'viem';

export const isValidReservedSlot = (slot: object): slot is ReservedContributorStruct => {
  if (!('addr' in slot) || !('amount' in slot)) return false;

  if (typeof slot.addr !== 'string' || !isAddress(slot.addr)) return false;

  return typeof slot.amount === 'bigint';
};

export const isValidReservedSlots = (
  slots: Array<object>
): slots is Array<ReservedContributorStruct> => {
  if (!Array.isArray(slots)) return false;

  if (slots.length === 0) return true;

  for (const slot of slots) {
    if (!isValidReservedSlot(slot)) return false;
  }

  return true;
};

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
