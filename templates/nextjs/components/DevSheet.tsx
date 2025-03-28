'use client';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@session/ui/ui/sheet';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {  SOCIALS } from '@/lib/constants';
import { Social } from '@session/ui/components/SocialLinkList';
import type { BuildInfo } from '@session/util-js/build';
import { getEnvironment, isProduction } from '@session/util-js/env';
import { CopyToClipboardButton } from '@session/ui/components/CopyToClipboardButton';

/** TODO: This was copied from the staking portal, investigate if we can turn it into a shared library */

export function DevSheet({
  buildInfo,
}: {
  buildInfo: BuildInfo;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Checks for the ctrl + k key combination
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (event.code === 'Escape') {
        setIsOpen(false);
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const { COMMIT_HASH, COMMIT_HASH_PRETTY } = buildInfo.env;

  const textToCopy = useMemo(() => {
    const sections = [
      `Commit Hash: ${COMMIT_HASH}`,
      `Build Env: ${getEnvironment()}`,
      `Is Production: ${isProduction() ? 'True' : 'False'}`,
      `User Agent: ${navigator.userAgent}`,
    ];
    return sections.join('\n');
  }, [navigator.userAgent]);

  return (
    <Sheet open={isOpen}>
      <SheetContent
        closeSheet={() => setIsOpen(false)}
        className="bg-session-white text-session-text-black"
      >
        <SheetHeader>
          <SheetTitle>Welcome to the danger zone</SheetTitle>
          <SheetDescription className="text-session-text-black-secondary">
            This sheet only shows when the site is in development mode.
          </SheetDescription>
          <SheetTitle>
            Build Info{' '}
            {textToCopy ? (
              <CopyToClipboardButton
                className="bg-session-black"
                textToCopy={textToCopy}
                copyToClipboardToastMessage={textToCopy}
                data-testid={'button:dont-worry-about-it'}
              />
            ) : null}
          </SheetTitle>
          <span className="inline-flex justify-start gap-1 align-middle">
            {'Commit Hash:'}
            <Link
              href={`${SOCIALS[Social.Github].link}/commit/${buildInfo.env.COMMIT_HASH}`}
              target="_blank"
              className="text-session-green-dark"
            >
              <span>{COMMIT_HASH_PRETTY}</span>
            </Link>
          </span>
          <span className="inline-flex justify-start gap-1 align-middle">
            {'Build Env:'}
            <span className="text-session-green-dark">{getEnvironment()}</span>
          </span>
          <span className="inline-flex justify-start gap-1 align-middle">
            {'Is Production:'}
            <span className="text-session-green-dark">{isProduction() ? 'True' : 'False'}</span>
          </span>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
