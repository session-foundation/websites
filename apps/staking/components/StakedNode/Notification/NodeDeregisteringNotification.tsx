import { BaseNodeNotificationText } from '@/components/StakedNode/Notification/BaseNodeNotificationText';
import { SESSION_NODE_TIME } from '@/lib/constants';
import { formatLocalizedTimeFromSeconds, useFormatDate } from '@/lib/locale-client';
import { Tooltip } from '@session/ui/ui/tooltip';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import useRelativeTime from '@/hooks/useRelativeTime';
import { isDateSoonOrPast } from '@/lib/maths';

export const NodeDeregisteringNotification = ({
  date,
}: {
  date: Date | null;
}) => {
  const { chainId } = useWallet();
  const dictionary = useTranslations('nodeCard.staked');
  const generalDictionary = useTranslations('general');
  const notFoundString = generalDictionary('notFound');
  const soonString = generalDictionary('soon');

  const timeString = useRelativeTime(date, { addSuffix: true });
  const formattedDate = useFormatDate(date, { dateStyle: 'full', timeStyle: 'short' });

  const isDeregistrationSoon = isDateSoonOrPast(date);
  const relativeTime = useMemo(
    () => (!isDeregistrationSoon ? timeString : soonString) ?? notFoundString,
    [isDeregistrationSoon, timeString, soonString, notFoundString]
  );

  return (
    <Tooltip
      tooltipContent={dictionary.rich('deregistrationTimerDescription', {
        lockedStakeTime: formatLocalizedTimeFromSeconds(
          SESSION_NODE_TIME(chainId).DEREGISTRATION_LOCKED_STAKE_SECONDS,
          { unit: 'day' }
        ),
        relativeTime,
        date: formattedDate ?? notFoundString,
      })}
    >
      <BaseNodeNotificationText level="error">
        {dictionary.rich('deregistrationTimerNotification', { relativeTime })}
      </BaseNodeNotificationText>
    </Tooltip>
  );
};
