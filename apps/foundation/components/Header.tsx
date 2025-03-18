import RouterResetInput from '@/components/RouterResetInput';
import { SANITY_SCHEMA_URL } from '@/lib/constants';
import logger from '@/lib/logger';
import { client } from '@/lib/sanity/sanity.client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { resolveAmbiguousLink } from '@session/sanity-cms/schemas/fields/basic/links';
import type { SiteSchemaType } from '@session/sanity-cms/schemas/site';
import { NavLink, type NavLinkProps } from '@session/ui/components/NavLink';
import { HamburgerIcon } from '@session/ui/icons/HamburgerIcon';
import { XIcon } from '@session/ui/icons/XIcon';
import { cn } from '@session/ui/lib/utils';
import { safeTry } from '@session/util-js/try';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { type HTMLAttributes, forwardRef } from 'react';

type HeaderProps = {
  headerLinks?: SiteSchemaType['headerLinks'];
};

export default async function Header({ headerLinks }: HeaderProps) {
  const dictionary = await getTranslations('header');
  const routes: Array<NavLinkProps> = [];

  if (headerLinks) {
    const [err, resolvedLinks] = await safeTry(
      Promise.all(
        headerLinks.map((link) => resolveAmbiguousLink(client, link, SANITY_SCHEMA_URL.POST))
      )
    );

    if (err) {
      logger.error(err);
    } else {
      for (const { href, label } of resolvedLinks) {
        if (href && label) {
          routes.push({ href, label });
        } else {
          logger.warn(`Header link is missing href (${href}) or label (${label})`);
        }
      }
    }
  }

  return (
    <nav className="z-30 flex touch-none flex-wrap items-center justify-between pt-6 pb-2 md:touch-auto md:pb-6">
      <div className="flex flex-row items-center gap-10 ps-6 pe-4">
        <Link href="/" prefetch>
          <Image src="/images/logo.svg" alt="Session Foundation Logo" width={100} height={40} />
        </Link>
        <div className="hidden h-max flex-row gap-10 text-session-text-black-secondary md:flex">
          {routes.map(({ href, label }) => (
            <NavLink key={`header-desktop-${href}`} href={href} label={label} />
          ))}
        </div>
      </div>
      <RouterResetInput id="mobile-menu-toggle" className="peer hidden appearance-none" />
      <ToggleMobileMenuButton
        htmlFor="mobile-menu-toggle"
        ariaLabel={dictionary('mobileMenuButtonOpen')}
        className="me-4 block justify-end transition-all peer-checked:hidden md:hidden"
      >
        <HamburgerIcon className="stroke-[3]" />
      </ToggleMobileMenuButton>
      <ToggleMobileMenuButton
        htmlFor="mobile-menu-toggle"
        ariaLabel={dictionary('mobileMenuButtonClose')}
        className="me-4 hidden animate-out justify-end p-2 transition-all duration-300 ease-in-out peer-checked:block peer-checked:rotate-90 motion-reduce:animate-none md:hidden peer-checked:md:hidden"
      >
        <XIcon className="h-full w-full" />
      </ToggleMobileMenuButton>
      <div
        className={cn(
          'flex w-screen flex-col items-center gap-8 text-lg',
          'h-dvh max-h-0 select-none overflow-y-hidden transition-all duration-300 ease-in-out peer-checked:mt-[10vh] peer-checked:max-h-dvh peer-checked:touch-none peer-checked:select-auto motion-reduce:transition-none md:peer-checked:mt-0 md:peer-checked:max-h-0'
        )}
      >
        {routes.map(({ href, label }) => (
          <NavLink key={`header-mobile-${href}`} href={href} label={label} />
        ))}
      </div>
    </nav>
  );
}

type ToggleMobileMenuButtonProps = HTMLAttributes<HTMLLabelElement> & {
  htmlFor: string;
  ariaLabel: string;
};

const ToggleMobileMenuButton = forwardRef<HTMLLabelElement, ToggleMobileMenuButtonProps>(
  ({ ariaLabel, className, ...props }, ref) => {
    return (
      // biome-ignore lint/a11y/noLabelWithoutControl: This is a toggle button
      <label
        ref={ref}
        data-testid={ButtonDataTestId.Dropdown_Hamburger_Menu}
        aria-label={ariaLabel}
        className={cn(
          'flex h-12 w-12 cursor-pointer select-none items-center align-middle [stroke-linecap:round]',
          className
        )}
        {...props}
      />
    );
  }
);
