'use client';

import { SOCIALS } from '@/lib/constants';
import { Social } from '@session/ui/components/SocialLinkList';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { ReactNode } from 'react';

export function ClaimRewardsDisabledInfo() {
  const dictionary = useTranslations('banner');
  return (
    <span>
      {dictionary.rich('claimRewardsDisabled', {
        link: (children: ReactNode) => (
          <Link
            className="font-medium underline"
            href={SOCIALS[Social.Discord].link}
            referrerPolicy="no-referrer"
            target="_blank"
          >
            {children}
          </Link>
        ),
      })}
    </span>
  );
}
