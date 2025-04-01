import ScreenContainer from '@/components/ScreenContainer';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return <ScreenContainer>{children}</ScreenContainer>;
}
