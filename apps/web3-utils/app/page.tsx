'use client';

import Typography from '@session/ui/components/Typography';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function LandingPage() {
  const dict = useTranslations('home');
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Typography variant="h1">{dict('title')}</Typography>
      <ul>
        <li>
          <Link className="text-session-green hover:text-session-green-dark" href="/sign">
            {dict('signLink')}
          </Link>
        </li>
      </ul>
    </div>
  );
}
