'use client';

import { useWallet } from '@session/wallet/hooks/useWallet';
import { AddressInfo } from '@/app/address/[address]/addressInfo';

export default function Page() {
  const { address } = useWallet();
  return address ? <AddressInfo address={address} /> : null;
}
