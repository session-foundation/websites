import { CollapsableContent } from '@/components/NodeCard';
import useRelativeTime from '@/hooks/useRelativeTime';
import { formatNumber, useFormatDate } from '@/lib/locale-client';
import { Tooltip } from '@session/ui/ui/tooltip';
import { useTranslations } from 'next-intl';

export type NodeCardLastRewardProps = {
  lastRewardBlock?: number;
  lastRewardDate?: Date | null;
};

export function NodeCardLastReward({ lastRewardBlock, lastRewardDate }: NodeCardLastRewardProps) {
  const dictionary = useTranslations('nodeCard.staked');

  const generalDictionary = useTranslations('general');
  const notFoundString = generalDictionary('notFound');

  const lastRewardTime = useRelativeTime(lastRewardDate, { addSuffix: true });
  const formattedLastRewardDate = useFormatDate(lastRewardDate, {
    dateStyle: 'full',
    timeStyle: 'short',
  });
  return (
    <CollapsableContent size="xs">
      <Tooltip
        tooltipContent={dictionary('lastRewardDescription', {
          blockNumber: lastRewardBlock ? formatNumber(lastRewardBlock) : notFoundString,
          date: formattedLastRewardDate ?? notFoundString,
        })}
      >
        <span className="font-normal text-gray-lightest">
          {dictionary('lastReward', {
            relativeTime: lastRewardTime ?? notFoundString,
          })}
        </span>
      </Tooltip>
    </CollapsableContent>
  );
}
