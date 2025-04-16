import { SANITY_SCHEMA_URL } from '@/lib/constants';
import logger from '@/lib/logger';
import { client } from '@/lib/sanity/sanity.client';
import { getContentById } from '@session/sanity-cms/queries/getContent';
import { resolveAmbiguousLink } from '@session/sanity-cms/schemas/fields/basic/links';
import type { SiteSchemaType } from '@session/sanity-cms/schemas/site';
import type { SocialSchemaType } from '@session/sanity-cms/schemas/social';
import { NavLink, type NavLinkProps } from '@session/ui/components/NavLink';
import SocialLinkList, {
  type Social,
  type SocialLink,
} from '@session/ui/components/SocialLinkList';
import { FlagOfSwitzerlandIcon } from '@session/ui/icons/FlagOfSwitzerlandIcon';
import { cn } from '@session/ui/lib/utils';
import { safeTry } from '@session/util-js/try';
import Image from 'next/image';
import Link from 'next/link';

import { cleanSanityString } from '@session/sanity-cms/lib/string';

type FooterProps = {
  copyright?: SiteSchemaType['copyright'];
  differentFooterLinksFromHeader?: SiteSchemaType['differentFooterLinksFromHeader'];
  footerLinks?: SiteSchemaType['footerLinks'];
  headerLinks?: SiteSchemaType['headerLinks'];
  showSocialLinksInFooter?: SiteSchemaType['showSocialLinksInFooter'];
  footerSocialLinks?: SiteSchemaType['footerSocialLinks'];
  className?: string;
};

//biome-ignore lint/complexity/noExcessiveCognitiveComplexity: complexity out of necessity
export async function Footer({
  copyright,
  differentFooterLinksFromHeader,
  footerLinks,
  headerLinks,
  showSocialLinksInFooter,
  footerSocialLinks,
  className,
}: FooterProps) {
  const routes: Array<NavLinkProps> = [];

  const links = differentFooterLinksFromHeader ? footerLinks : headerLinks;

  if (links) {
    const [err, resolvedLinks] = await safeTry(
      Promise.all(links.map((link) => resolveAmbiguousLink(client, link, SANITY_SCHEMA_URL.POST)))
    );

    if (err) {
      logger.error(err);
    } else {
      for (const { href, label } of resolvedLinks) {
        if (href && label) {
          routes.push({ href, label });
        } else {
          logger.warn(`Footer link is missing href (${href}) or label (${label})`);
        }
      }
    }
  }

  const socialLinkItems: Array<SocialLink> = [];

  if (showSocialLinksInFooter && footerSocialLinks?.length) {
    const [err, resolvedLinks] = await safeTry(
      Promise.all(
        footerSocialLinks.map((link) =>
          getContentById<SocialSchemaType>({
            client,
            id: link._ref,
          })
        )
      )
    );

    if (err) {
      logger.error(err);
    } else {
      for (const link of resolvedLinks) {
        if (!link) {
          logger.warn('Footer social link is missing');
          return;
        }

        const { url, social } = link;
        if (url && social) {
          socialLinkItems.push({ link: url, name: cleanSanityString(social) as Social });
        } else {
          logger.warn(`Footer social link is missing url (${url}) or social (${social})`);
        }
      }
    }
  }

  return (
    <div className={cn('my-16 flex w-full flex-col gap-2 text-sm md:text-base', className)}>
      {copyright ? (
        <span className="inline-flex items-center gap-1.5 font-source-serif text-xs italic md:text-base">
          <FlagOfSwitzerlandIcon className="inline-block h-5 w-5 md:h-6 md:w-6" />
          {`© ${copyright}`}
        </span>
      ) : null}
      <div className="h-px w-full bg-gray-dark" />
      <div className="mt-3 flex flex-row justify-between md:mt-6">
        <div className="flex h-max flex-col gap-3 md:gap-6">
          {routes.map(({ label, href }) => (
            <NavLink hideActiveIndicator key={`footer-${href}`} href={href} label={label} />
          ))}
        </div>
        <div>
          <Link href="/" prefetch>
            <Image
              src="/images/logo.svg"
              alt="Session Foundation Logo"
              width={200}
              height={80}
              className="w-36 md:w-52"
            />
          </Link>
          {showSocialLinksInFooter && socialLinkItems.length ? (
            <SocialLinkList
              socialLinks={socialLinkItems}
              className={cn(
                'mt-4 flex w-full max-w-36 flex-row flex-wrap justify-end gap-3',
                'sm:max-w-none'
              )}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
