import type { ReactNode } from 'react';

export default function ScreenContainer({ children }: { children: ReactNode }) {
  return <div className="-mt-header-displacement h-dvh pt-header-displacement">{children}</div>;
}
