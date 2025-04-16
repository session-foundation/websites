import { VisualEditing } from 'next-sanity';
import { type ReactNode, Suspense } from 'react';
import { isDraftModeEnabled } from '../lib/util';
import SanityDisableDraftMode from './SanityDisableDraftMode';

export default async function SanityLayout({
  children,
  disableDraftModePath,
}: {
  children: ReactNode;
  disableDraftModePath: string;
}) {
  const isDraftMode = await isDraftModeEnabled();
  return (
    <>
      {isDraftMode ? (
        <Suspense>
          <SanityDisableDraftMode disableDraftModePath={disableDraftModePath} />
        </Suspense>
      ) : null}
      {children}
      {isDraftMode ? <VisualEditing /> : null}
    </>
  );
}
