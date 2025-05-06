'use client';

import { LinkOutIcon } from '@session/ui/icons/LinkOutIcon';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export const ArbitrumBlockExplorerLink = ({ address }: { address: string }) => {
  return (
    <Link href={`/explorer/arbitrum/address/${address}`} target="_blank" prefetch={false}>
      <ArbitrumBlockExplorerLinkText />
    </Link>
  );
};

export const ArbitrumBlockExplorerLinkText = () => {
  const generalDictionary = useTranslations('general');
  return (
    <span className="inline-flex items-center gap-1 fill-session-green align-middle text-session-green">
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
