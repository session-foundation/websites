import type { ReactNode } from 'react';
import { siteMetadata } from '@/lib/metadata';

export function generateMetadata() {
  return siteMetadata({
    title: 'Testnet Leaderboard',
    description:
      'Track the top-performing wallets in the Session Testnet Incentive Program. Rankings are based on total points earned through running and staking to nodes.',
  });
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
