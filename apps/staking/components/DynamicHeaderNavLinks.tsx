'use client';

import { NavLink } from '@/components/NavLink';
import { DYNAMIC_LINKS } from '@/lib/constants';
import { useActiveVestingContract } from '@/providers/vesting-provider';
import { cn } from '@session/ui/lib/utils';
import { useTranslations } from 'next-intl';

export default function DynamicHeaderNavLinks() {
  const dict = useTranslations('navigation');
  const vestingContract = useActiveVestingContract();
  return (
    <>
      <NavLink
        className={cn(!vestingContract ? 'hidden lg:block' : 'hidden')}
        href={DYNAMIC_LINKS.myStakes.href}
        label={dict(DYNAMIC_LINKS.myStakes.dictionaryKey)}
        /* TODO: remove once we have proper skeletons and can dynamically import them */
        suppressHydrationWarning
      />
      <NavLink
        className={cn(vestingContract ? 'hidden lg:block' : 'hidden')}
        href={DYNAMIC_LINKS.vestedStakes.href}
        label={dict(DYNAMIC_LINKS.vestedStakes.dictionaryKey)}
        /* TODO: remove once we have proper skeletons and can dynamically import them */
        suppressHydrationWarning
      />
    </>
  );
}
