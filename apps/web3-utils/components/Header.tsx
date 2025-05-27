import HeaderClient from '@/components/HeaderClient';
import { NavLink } from '@/components/NavLink';
import { SSR_LINKS } from '@/lib/constants';
import { NEXT_PUBLIC_BRANDED } from '@/lib/env';
import Typography from '@session/ui/components/Typography';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';

export default async function Header() {
  const dict = await getTranslations('navigation');

  return (
    <nav className="z-30 flex items-center justify-between p-6">
      <HeaderClient>
        <Link href="/" className="relative">
          {NEXT_PUBLIC_BRANDED ? (
            <Image src="/images/logo.png" alt="Session Token Logo" width={144} height={50} />
          ) : (
            <Typography variant="strong">{dict('title')}</Typography>
          )}
        </Link>

        <div className="hidden flex-row gap-10 lg:flex">
          {SSR_LINKS.map(({ dictionaryKey, href }) => {
            return <NavLink key={href} href={href} label={dict(dictionaryKey)} />;
          })}
        </div>
      </HeaderClient>
    </nav>
  );
}
