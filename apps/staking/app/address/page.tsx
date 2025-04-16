'use client';

import { AddressInfo } from '@/app/address/[address]/addressInfo';
import { useWallet } from '@session/wallet/hooks/useWallet';

export default function Page() {
  const { address } = useWallet();
  return address ? <AddressInfo address={address} /> : null;
}
