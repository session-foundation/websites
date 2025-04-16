'use client';

import { SOCIALS } from '@/lib/constants';
import { Social } from '@session/ui/components/SocialLinkList';
import { useTranslations } from 'next-intl';
<<<<<<< HEAD
import { LinkDataTestId } from '@/testing/data-test-ids';
=======
import Link from 'next/link';
import type { ReactNode } from 'react';
>>>>>>> dev

export function ClaimRewardsDisabledInfo() {
  const dictionary = useTranslations('banner');
  return (
    <span>
      {dictionary.rich('claimRewardsDisabled', {
        link: (children: ReactNode) => (
          <Link
            className="font-medium underline"
            data-testid={LinkDataTestId.Claim_Disabled}
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
