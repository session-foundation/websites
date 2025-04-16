'use client';

import { cn } from '@session/ui/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export type NavLinkProps = {
  href: string;
  dataTestId?: string;
  label?: string;
  children?: ReactNode;
  ariaLabel?: string;
  className?: string;
  suppressHydrationWarning?: boolean;
};

/**
 * Returns true of a href is to an external link
 * @param href the link
 */
function isExternalLink(href: string): boolean {
  if (href.startsWith('http://')) {
    throw new Error(`http links are forbidden, use https. Link: ${href}`);
  }
  return href.startsWith('https://');
}

<<<<<<< HEAD
export function NavLink({ dataTestId, href, label, children, ariaLabel }: NavLinkProps) {
=======
export function NavLink({
  href,
  label,
  children,
  ariaLabel,
  className,
  suppressHydrationWarning,
}: NavLinkProps) {
>>>>>>> dev
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={cn(
        'hover:text-session-green',
        pathname.startsWith(href) && 'text-session-green',
        className
      )}
      aria-label={ariaLabel}
      data-testid={dataTestId}
      {...(isExternalLink(href)
        ? {
            target: '_blank',
            referrerPolicy: 'no-referrer',
          }
        : {})}
      /* TODO: remove once we have proper skeletons and can dynamically import them */
      suppressHydrationWarning={suppressHydrationWarning}
    >
      {children ?? label}
    </Link>
  );
}
