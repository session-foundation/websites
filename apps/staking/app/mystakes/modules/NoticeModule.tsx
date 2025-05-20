'use client';

import { WizardSectionDescription } from '@/components/Wizard';
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
          <WizardSectionDescription
            description={dict.rich('description', { linkOut: '' })}
            href="https://docs.getsession.org/session-network"
          />
          {dict.rich('description2', {
            'bridge-link': externalLink('/claim/oxen'),
          })}
        </Typography>
      </ModuleHeader>
    </Module>
  );
}
