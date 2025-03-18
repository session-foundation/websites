'use client';

import ActionModule from '@/components/ActionModule';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const dict = useTranslations('general');

  return <ActionModule background={1}>{dict('notFound')}</ActionModule>;
}
