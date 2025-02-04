import type { ReservedContributorStruct } from '@/hooks/useCreateOpenNodeRegistration';
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

// TODO: Implement the reserve slots
export function ReserveSlotsInputTab() {
  // const dictionary = useTranslations('actionModules.registration.reserveSlots');
  return <div className="flex w-full flex-col gap-4">{null}</div>;
}
