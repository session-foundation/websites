'use client';

import { useEnsName } from '@session/wallet/hooks/useEnsName';

export function AddressModalTitle({ address }: { address: string }) {
  const { ensName } = useEnsName(address);
  return <div className="flex w-full items-center justify-center">{ensName ?? address}</div>;
}
