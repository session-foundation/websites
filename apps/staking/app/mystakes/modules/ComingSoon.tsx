'use client';

import { Module, ModuleTitle, ModuleTooltip } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';

export default function ComingSoonModule() {
  const dictionary = useTranslations('modules.comingSoon');

  return (
    <Module>
      <ModuleTooltip>{dictionary.rich('description')}</ModuleTooltip>
      <ModuleTitle>{dictionary('title')}</ModuleTitle>
    </Module>
  );
}
