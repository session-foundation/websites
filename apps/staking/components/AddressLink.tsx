import { LinkOutIcon } from '@session/ui/icons/LinkOutIcon';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { Address } from 'viem';

export function AddressLink({ address, iconOnly }: { address: Address; iconOnly: boolean }) {
  const dictionary = useTranslations('general');
  return (
    <Link
      href={`/address/${address}`}
      className="inline-flex w-max items-center gap-1 fill-session-green align-middle text-session-green"
    >
      {!iconOnly ? <span className="inline-flex">{dictionary('viewOnExplorerShort')}</span> : null}
      <LinkOutIcon className="h-4 w-4" />
    </Link>
  );
}
