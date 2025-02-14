'use client';

import { LinkOutIcon } from '@session/ui/icons/LinkOutIcon';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export const BlockExplorerLink = ({ address }: { address: string }) => {
  return (
    <Link href={`/explorer/address/${address}`} target="_blank" prefetch={false}>
      <BlockExplorerLinkText />
    </Link>
  );
};

export const BlockExplorerLinkText = () => {
  const generalDictionary = useTranslations('general');
  return (
    <span className="text-session-green fill-session-green inline-flex items-center gap-1 align-middle">
      <span className="hidden sm:inline-flex xl:hidden 2xl:inline-flex">
        {generalDictionary('viewOnExplorer')}
      </span>
      <span className="inline-flex sm:hidden xl:inline-flex 2xl:hidden">
        {generalDictionary('viewOnExplorerShort')}
      </span>
      <LinkOutIcon className="h-4 w-4" />
    </span>
  );
};
