import { CollapsableContent, type CollapsableContentProps } from '@/components/NodeCard';
import useRelativeTime from '@/hooks/useRelativeTime';
import { msInBlocks } from '@/lib/blocks';
import { formatNumber, useFormatDate } from '@/lib/locale-client';
import { Tooltip } from '@session/ui/ui/tooltip';
import { useTranslations } from 'next-intl';

export type NodeCardLastUptimeProps = CollapsableContentProps & {
  lastUptimeProofSeconds: number;
  blockHeight: number;
  lastUptimeDate?: Date | null;
};

export function NodeCardLastUptime({
  forceExpanded,
  width,
  size,
  lastUptimeProofSeconds,
  blockHeight,
  lastUptimeDate,
}: NodeCardLastUptimeProps) {
  const lastUptimeTime = useRelativeTime(lastUptimeDate, { addSuffix: true });
  const formattedLastUptimeDate = useFormatDate(lastUptimeDate, {
    dateStyle: 'full',
    timeStyle: 'short',
  });
  const dictionary = useTranslations('nodeCard.staked');
  const generalDictionary = useTranslations('general');
  const notFoundString = generalDictionary('notFound');
  return (
    <CollapsableContent size={size} width={width} forceExpanded={forceExpanded}>
      <Tooltip
        tooltipContent={dictionary('lastUptimeDescription', {
          blockNumber: lastUptimeProofSeconds
            ? formatNumber(blockHeight - msInBlocks(Date.now() - lastUptimeProofSeconds * 1000))
            : notFoundString,
          date: formattedLastUptimeDate ?? notFoundString,
        })}
      >
        <span className="font-normal text-gray-lightest">
          {dictionary('lastUptime', { relativeTime: lastUptimeTime ?? notFoundString })}
        </span>
      </Tooltip>
    </CollapsableContent>
  );
}
