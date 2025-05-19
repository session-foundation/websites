import { siteMetadata } from '@/lib/metadata';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

export async function generateMetadata() {
  return await siteMetadata({
    title: 'Faucet',
    description: 'Claim test SESH to participate in the Session Testnet.',
  });
}

export default function FaucetLayout({ children }: { children: ReactNode }) {
  if (process.env.NEXT_PUBLIC_ENABLE_FAUCET?.toLowerCase() !== 'true') {
    return notFound();
  }
  return children;
}
