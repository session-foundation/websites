'use client';

import { clickableText, underlinedTooltip } from '@/lib/locale-defaults';
import { useVesting } from '@/providers/vesting-provider';
import { Module, ModuleHeader } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';

export default function VestingInfoModule() {
  const dict = useTranslations('vesting.modules.info');
  const { disconnectFromVestingContract } = useVesting();
  return (
    <Module size="lg" className="flex flex-grow overflow-y-auto">
      <ModuleHeader className="h-full text-start">
        <p className="font-bold text-lg">{dict('title')}</p>
        <p className="mt-4">
          {dict.rich('description1', {
            'underlined-tooltip': underlinedTooltip(dict('vestingTokensTooltip')),
          })}
          <br />
          <br />
          {dict.rich('description2', {
            'my-stakes-link': clickableText(disconnectFromVestingContract),
          })}
          <br />
          <br />
          {dict.rich('description3')}
        </p>
      </ModuleHeader>
    </Module>
  );
}
