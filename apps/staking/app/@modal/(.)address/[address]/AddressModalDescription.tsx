'use client';

import { useEnsName } from '@session/wallet/hooks/useEnsName';

export function AddressModalDescription({ address }: { address: string }) {
  const { hasName } = useEnsName(address);
  return hasName ? address : undefined;
}
