'use client';

import { useWallet } from '@session/wallet/hooks/wallet-hooks';
import { AddressInfo } from '@/app/address/[address]/addressInfo';

export default function Page() {
  const { address } = useWallet();
  return address ? <AddressInfo address={address} /> : null;
}
