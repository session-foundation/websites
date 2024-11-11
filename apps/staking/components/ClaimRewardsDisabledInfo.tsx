'use client';

import Link from 'next/link';
import { SOCIALS } from '@/lib/constants';
import { Social } from '@session/ui/components/SocialLinkList';
import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { LinkDataTestId } from '@/testing/data-test-ids';

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
