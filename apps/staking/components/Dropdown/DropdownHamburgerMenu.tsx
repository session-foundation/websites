'use client';

import { DYNAMIC_LINKS, EXTERNAL_ROUTES, SSR_LINKS } from '@/lib/constants';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { HamburgerIcon } from '@session/ui/icons/HamburgerIcon';
import { Button } from '@session/ui/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@session/ui/ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import { DropdownMenuItemGetSesh, DropdownMenuItemNavLink } from './DropdownMenuItemNavLink';

export function DropdownHamburgerMenu() {
  const dictionary = useTranslations('navigation.hamburgerDropdown');
  const navDictionary = useTranslations('navigation');

  const routes: typeof SSR_LINKS = [];
  for (const { dictionaryKey, href } of [DYNAMIC_LINKS.myStakes, ...SSR_LINKS]) {
    if (
      dictionaryKey === 'faucet' &&
      !(process.env.NEXT_PUBLIC_ENABLE_FAUCET?.toLowerCase() === 'true')
    ) {
      continue;
    }
    routes.push({ dictionaryKey, href });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="md"
          data-testid={ButtonDataTestId.Dropdown_Hamburger_Menu}
          className="group p-0"
          aria-label={dictionary('ariaLabel')}
          variant="outline"
        >
          <HamburgerIcon className="m-1.5 h-8 w-8 stroke-session-green group-hover:stroke-session-black" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-max">
        {routes.map(({ dictionaryKey, href }) => (
          <DropdownMenuItemNavLink
            key={href}
            href={href}
            label={navDictionary(dictionaryKey)}
            className="block lg:hidden"
          />
        ))}
        {EXTERNAL_ROUTES.map(({ dictionaryKey, href }) => (
          <DropdownMenuItemNavLink key={href} href={href} label={navDictionary(dictionaryKey)} />
        ))}
        <DropdownMenuItemGetSesh network="eth" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
