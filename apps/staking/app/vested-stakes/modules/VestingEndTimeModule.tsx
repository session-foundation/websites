'use client';

import VestingClaimPrincipalModule from '@/app/vested-stakes/modules/VestingClaimPrincipalModule';
import useRelativeTime from '@/hooks/useRelativeTime';
import { useFormatDate } from '@/lib/locale-client';
import { useActiveVestingContract } from '@/providers/vesting-provider';
import { Module, ModuleText, ModuleTitle, ModuleTooltip } from '@session/ui/components/Module';
import { LoadingText } from '@session/ui/components/loading-text';
import { Tooltip } from '@session/ui/ui/tooltip';
import { useTranslations } from 'next-intl';

export function useVestingEndTime() {
  const contract = useActiveVestingContract();
  const date = contract ? new Date(contract?.time_end * 1000) : null;
  const formattedDate = useFormatDate(date, { dateStyle: 'full', timeStyle: 'long' });
  const relativeTime = useRelativeTime(date, { addSuffix: false });
  const isEnded = (date?.getTime() ?? 0) < Date.now();
  return { date, formattedDate, relativeTime, isEnded };
}

export default function VestingEndTimeModule() {
  const dict = useTranslations('vesting.modules.endTime');
  const titleFormat = useTranslations('modules.title');
  const title = dict('title');
  const { formattedDate, relativeTime, isEnded } = useVestingEndTime();

  return !isEnded ? (
    <Module>
      <ModuleTooltip>{dict.rich('description', { date: formattedDate })}</ModuleTooltip>
      <ModuleTitle>{titleFormat('format', { title })}</ModuleTitle>
      <ModuleText>
        <Tooltip tooltipContent={formattedDate} putContentInPortal>
          <div className="w-max cursor-pointer">{relativeTime ?? <LoadingText />}</div>
        </Tooltip>
      </ModuleText>
    </Module>
  ) : (
    <VestingClaimPrincipalModule />
  );
}
