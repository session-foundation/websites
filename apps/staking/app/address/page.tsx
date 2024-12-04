'use client';

import AddressPage from '@/app/address/[address]/page';
import { useWallet } from '@session/wallet/hooks/wallet-hooks';

export default function Page() {
  const { address } = useWallet();
  return address ? <AddressPage params={{ address }} /> : null;
}
