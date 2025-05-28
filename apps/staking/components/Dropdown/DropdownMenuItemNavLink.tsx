import { URL } from '@/lib/constants';
import { NavigationDataTestId } from '@/testing/data-test-ids';
import { SessionTokenIcon } from '@session/ui/icons/SessionTokenIcon';
import { cn } from '@session/ui/lib/utils';
import { DropdownMenuItem } from '@session/ui/ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import { NavLink, type NavLinkProps } from '../NavLink';

export function DropdownMenuItemNavLink({ label, children, ...props }: NavLinkProps) {
  return (
    <NavLink {...props}>
      <DropdownMenuItem className={props.className}>{children ?? label}</DropdownMenuItem>
    </NavLink>
  );
}

export function DropdownMenuItemGetSesh({ network }: { network: 'arb' | 'eth' }) {
  const navDictionary = useTranslations('navigation');
  return (
    <DropdownMenuItemNavLink
      href={network === 'arb' ? URL.TOKEN_UNISWAP_POOL_ARB : URL.TOKEN_UNISWAP_POOL_ETH}
      className={cn('inline-flex items-center gap-1.5', 'md:hidden')}
      data-testid={
        network === 'arb'
          ? NavigationDataTestId.Token_Uniswap_Pool_Arb
          : NavigationDataTestId.Token_Uniswap_Pool_Eth
      }
    >
      <SessionTokenIcon className="h-4 w-4" />
      {navDictionary('getToken')}
    </DropdownMenuItemNavLink>
  );
}
