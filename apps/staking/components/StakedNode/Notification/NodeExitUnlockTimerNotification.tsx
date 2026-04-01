import { BaseNodeNotificationText } from '@/components/StakedNode/Notification/BaseNodeNotificationText';
import { useFormatDate } from '@/lib/locale-client';
import { Tooltip } from '@session/ui/ui/tooltip';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import useRelativeTime from '@/hooks/useRelativeTime';
import { isDateSoonOrPast } from '@/lib/maths';

export const NodeExitUnlockTimerNotification = ({
  date,
  className,
  isDeregistered,
}: {
  date: Date | null;
  isDeregistered?: boolean;
  className?: string;
}) => {
  const dictionary = useTranslations('nodeCard.staked');
  const dictionaryGeneral = useTranslations('general');
  const notFoundString = dictionaryGeneral('notFound');
  const soonString = dictionaryGeneral('soon');
  const formattedDate = useFormatDate(date, { dateStyle: 'full', timeStyle: 'short' });

  const timeString = useRelativeTime(date, { addSuffix: true });
  const [isExitableSoon, isPastTime] = useMemo(
    () => [isDateSoonOrPast(date), date && Date.now() > date.getTime()],
    [date]
  );

  const relativeTime = useMemo(
    () => (!isExitableSoon ? timeString : soonString),
    [isExitableSoon, timeString, soonString]
  );

  if (isPastTime) {
    return null;
  }

  return (
    <Tooltip
      tooltipContent={dictionary.rich(
        isDeregistered ? 'deregisteredTimerDescription' : 'exitUnlockTimerDescription',
        {
          relativeTime,
          date: formattedDate ?? notFoundString,
        }
      )}
    >
      <BaseNodeNotificationText level="warning" className={className}>
        {relativeTime
          ? dictionary.rich(
              isDeregistered ? 'deregisteredTimerNotification' : 'exitUnlockTimerNotification',
              {
                relativeTime,
              }
            )
          : dictionary.rich(
              isDeregistered ? 'deregisteredProcessing' : 'exitUnlockTimerProcessing'
            )}
      </BaseNodeNotificationText>
    </Tooltip>
  );
};
