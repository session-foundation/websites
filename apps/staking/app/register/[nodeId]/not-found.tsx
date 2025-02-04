'use client';

import { useTranslations } from 'next-intl';
import ActionModule from '@/components/ActionModule';

export default function NotFound() {
  const dict = useTranslations('general');

  return <ActionModule background={1}>{dict('notFound')}</ActionModule>;
}
