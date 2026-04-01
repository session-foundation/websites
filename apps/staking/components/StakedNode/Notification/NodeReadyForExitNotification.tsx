import { BaseNodeNotificationText } from '@/components/StakedNode/Notification/BaseNodeNotificationText';
import { WizardSectionDescription } from '@/components/Wizard';
import { Tooltip } from '@session/ui/ui/tooltip';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import useRelativeTime from '@/hooks/useRelativeTime';
import { isDateSoonOrPast } from '@/lib/maths';

export const NodeReadyForExitNotification = ({
  date,
  isDeregistered,
  className,
}: {
  date: Date | null;
  isDeregistered?: boolean;
  className?: string;
}) => {
  const dictionary = useTranslations('nodeCard.staked');
  const dictionaryGeneral = useTranslations('general');
  const soonString = dictionaryGeneral('soon');
  const nowString = dictionaryGeneral('now');

  const timeString = useRelativeTime(date, { addSuffix: false });
  const isLiquidationSoon = useMemo(() => isDateSoonOrPast(date), [date]);
  const relativeTimeNoSuffix = useMemo(
    () => (!isLiquidationSoon ? timeString : soonString) || nowString,
    [isLiquidationSoon, timeString, soonString, nowString]
  );

  return (
    <Tooltip
      tooltipContent={
        <WizardSectionDescription
          className="text-base md:text-base"
          description={dictionary.rich(
            isDeregistered
              ? 'liquidationDescription'
              : isLiquidationSoon
                ? 'exitTimerDescriptionNow'
                : 'exitTimerDescription',
            {
              relativeTimeNoSuffix,
              linkOut: '',
            }
          )}
          href="https://docs.getsession.org/contribute-to-the-session-network/frequently-asked-questions-faq#liquidation-penalty "
        />
      }
    >
      <BaseNodeNotificationText
        level={isLiquidationSoon ? 'error' : 'warning'}
        className={className}
      >
        {isLiquidationSoon
          ? dictionary.rich('exitTimerNotificationNow')
          : dictionary.rich('exitTimerNotification', { relativeTimeNoSuffix })}
      </BaseNodeNotificationText>
    </Tooltip>
  );
};
