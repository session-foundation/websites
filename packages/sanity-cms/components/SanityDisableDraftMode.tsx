'use client';

import { Button } from '@session/ui/ui/button';
import { Portal } from 'next/dist/client/portal';
import { ButtonDataTestId } from '../testing/data-test-ids';

export default function SanityDisableDraftMode({
  disableDraftModePath,
}: {
  disableDraftModePath: string;
}) {
  return (
    <Portal type="div">
      <a href={disableDraftModePath} className="fixed right-0 bottom-0 m-4">
        <Button data-testid={ButtonDataTestId.Disable_Draft_Mode} rounded="md" size="xs">
          Disable Draft Mode
        </Button>
      </a>
    </Portal>
  );
}
