import { siteMetadata } from '@/lib/metadata';
import type { ReactNode } from 'react';

export async function generateMetadata() {
  return await siteMetadata({
    title: 'Faucet',
    description: 'Claim test SESH to participate in the Session Testnet Incentive Program.',
  });
}

export default async function FaucetLayout({ children }: { children: ReactNode }) {
  return children;
}
