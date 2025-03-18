import { EXTERNAL_ROUTES, SOCIALS, SSR_LINKS } from '@/lib/constants';
import { Footer as FooterComp } from '@session/ui/components/Footer';
import { cn } from '@session/ui/lib/utils';

import { useTranslations } from 'next-intl';

export function Footer() {
  const dictionary = useTranslations('navigation');

  const routes: typeof SSR_LINKS = [];
  for (const { dictionaryKey, href } of SSR_LINKS) {
    if (
      dictionaryKey === 'faucet' &&
      !(process.env.NEXT_PUBLIC_ENABLE_FAUCET?.toLowerCase() === 'true')
    ) {
      return;
    }
    routes.push({ dictionaryKey, href });
  }

  const menuItems = [...routes, ...EXTERNAL_ROUTES].map(
    ({ dictionaryKey, href, linkType = 'internal' }) => ({
      title: dictionary(dictionaryKey),
      href: href,
      linkType,
    })
  );

  const socialLinks = Object.values(SOCIALS);

  return (
    <FooterComp
      logo={{ src: '/images/logo.png', alt: 'Session Token Logo' }}
      menuItems={menuItems}
      socialLinks={socialLinks}
      footerManagedBy={dictionary('managedBy')}
      className={cn('my-16 w-full max-w-screen-3xl px-8')}
    />
  );
}
