'use client';

import { Module, ModuleHeader, ModuleText } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';

export default function NoticeModule() {
  const dict = useTranslations('modules.notice');

  return (
    <Module size="lg" className="flex flex-grow">
      <ModuleHeader>
        <ModuleText>{dict('title')}</ModuleText>
        <br />
        {dict.rich('description')}
      </ModuleHeader>
    </Module>
  );
}
