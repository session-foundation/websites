import HeaderClient from '@/components/HeaderClient';
import { NavLink } from '@/components/NavLink';
import { SSR_LINKS } from '@/lib/constants';
import { cn } from '@session/ui/lib/utils';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';

export default async function Header() {
  const dict = await getTranslations('navigation');
  const isCanary = process.env.NEXT_PUBLIC_IS_CANARY?.toLowerCase() === 'true';

  return (
    <nav className="z-30 flex items-center justify-between p-6">
      <HeaderClient>
        <Link href="/" className="relative">
          <Image src="/images/logo.png" alt="Session Token Logo" width={144} height={50} />
          {isCanary ? <span className="-top-4 absolute left-1 h-max w-max text-sm">🐤</span> : null}
        </Link>
        <div className="hidden flex-row gap-10 lg:flex">
          {SSR_LINKS.map(({ dictionaryKey, href }) => {
            if (
              (dictionaryKey === 'faucet' &&
                !(process.env.NEXT_PUBLIC_ENABLE_FAUCET?.toLowerCase() === 'true')) ||
              (dictionaryKey === 'leaderboard' &&
                !(process.env.NEXT_PUBLIC_ENABLE_LEADERBOARD?.toLowerCase() === 'true'))
            ) {
              return null;
            }
            return (
              <NavLink
                key={href}
                href={href}
                label={dict(dictionaryKey)}
                className={cn(
                  dictionaryKey === 'faucet' || dictionaryKey === 'leaderboard'
                    ? 'hidden xl:block'
                    : ''
                )}
              />
            );
          })}
        </div>
      </HeaderClient>
    </nav>
  );
}
