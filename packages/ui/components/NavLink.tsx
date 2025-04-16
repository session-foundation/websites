'use client';

import { type VariantProps, cva } from 'class-variance-authority';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

/** TODO: This was copied from the staking portal, investigate if we can turn it into a shared library */

export const navlinkVariants = cva(
  'w-max border-b-2 border-b-transparent hover:border-b-session-green hover:text-session-text-black',
  {
    variants: {
      active: {
        true: 'border-b-session-green text-session-text-black',
        false: '',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

export type NavlinkVariantProps = VariantProps<typeof navlinkVariants>;

export type NavLinkProps = NavlinkVariantProps & {
  href: string;
  label?: string;
  children?: ReactNode;
  ariaLabel?: string;
  className?: string;
  unStyled?: boolean;
  htmlFor?: string;
  hideActiveIndicator?: boolean;
};

/**
 * Returns true of a href is to an external link
 * @param href the link
 */
export function isExternalLink(href: string): boolean {
  if (href.startsWith('http://')) {
    throw new Error(`http links are forbidden, use https. Link: ${href}`);
  }
  return href.startsWith('https://');
}

export function NavLink({
  href,
  label,
  children,
  ariaLabel,
  className,
  unStyled,
  hideActiveIndicator,
}: NavLinkProps) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={cn(
        !unStyled
          ? navlinkVariants({
              active:
                !hideActiveIndicator && href.length > 1
                  ? pathname.startsWith(href)
                  : pathname === href,
              className,
            })
          : className
      )}
      aria-label={ariaLabel}
      {...(isExternalLink(href)
        ? {
            target: '_blank',
            referrerPolicy: 'no-referrer',
          }
        : {})}
    >
      {children ?? label}
    </Link>
  );
}
