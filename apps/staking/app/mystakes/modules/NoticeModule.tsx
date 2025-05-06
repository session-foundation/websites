'use client';

import { URL } from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import { Module, ModuleHeader, ModuleText } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';

export default function NoticeModule() {
  const dict = useTranslations('modules.notice');

  return (
    <Module size="lg" className="flex flex-grow">
      <ModuleHeader>
        <ModuleText>{dict('title')}</ModuleText>
        <br />
        <br />
        {dict.rich('description', {
          link: externalLink(URL.DOCS),
          'bridge-link': externalLink('https://getsession.org/'),
        })}
      </ModuleHeader>
    </Module>
  );
}
