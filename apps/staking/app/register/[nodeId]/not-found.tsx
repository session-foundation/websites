'use client';

import { useTranslations } from 'next-intl';
import ActionModule from '@/components/ActionModule';

export default function NotFound() {
  const dictRegister = useTranslations('actionModules.register');

  return (
    <ActionModule background={1} title={dictRegister('title')}>
      {dictRegister('notFound.description')}
    </ActionModule>
  );
}
