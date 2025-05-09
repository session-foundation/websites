'use client';

import { URL } from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import { Module, ModuleHeader, ModuleText } from '@session/ui/components/Module';
import Typography from '@session/ui/components/Typography';
import { useTranslations } from 'next-intl';

export default function NoticeModule() {
  const dict = useTranslations('modules.notice');

  return (
    <Module size="lg" className="flex flex-grow">
      <ModuleHeader className="overflow-auto">
        <ModuleText>{dict('title')}</ModuleText>
        <Typography variant="p" className="mt-6">
          {dict.rich('description', {
            link: externalLink(URL.DOCS),
            'bridge-link': externalLink('https://getsession.org/'),
          })}
        </Typography>
      </ModuleHeader>
    </Module>
  );
}
