import { NodeContributorList } from '@/components/NodeCard';
import { NodeNotification } from '@/components/StakedNode/Notification/NodeNotification';
import {
  STAKE_EVENT_STATE,
  STAKE_STATE,
  isStakeRequestingExit,
  parseStakeEventState,
} from '@/components/StakedNode/state';
import { isReadyToExitByUnlock } from '@/components/StakedNodeCard';
import { SESSION_NODE_TIME, SESSION_NODE_TIME_STATIC, URL } from '@/lib/constants';
import { formatLocalizedTimeFromSeconds, useFormatDate } from '@/lib/locale-client';
import { externalLink } from '@/lib/locale-defaults';
import { StakedNodeDataTestId } from '@/testing/data-test-ids';
import type { Stake } from '@session/staking-api-js/schema';
import { Tooltip } from '@session/ui/ui/tooltip';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

/**
 * Checks if a given date is in the past or `soon`
 * @see {@link SESSION_NODE_TIME_STATIC.SOON_TIME}
 * @param date - The date to check.
 * @returns `true` if the date is in the past or `soon`, `false` otherwise.
 */
const isDateSoonOrPast = (date: Date | null): boolean =>
  !!(date && Date.now() > date.getTime() - SESSION_NODE_TIME_STATIC.SOON_TIME);

export const ReadyForExitNotification = ({
  date,
  timeString,
  isDeregistered,
  className,
}: {
  date: Date | null;
  timeString: string | null;
  isDeregistered?: boolean;
  className?: string;
}) => {
  const dictionary = useTranslations('nodeCard.staked');
  const dictionaryGeneral = useTranslations('general');
  const soonString = dictionaryGeneral('soon');

  const isLiquidationSoon = useMemo(() => isDateSoonOrPast(date), [date]);
  const relativeTime = useMemo(
    () => (!isLiquidationSoon ? timeString : soonString) ?? '',
    [isLiquidationSoon, timeString, soonString]
  );

  return (
    <Tooltip
      tooltipContent={dictionary.rich(
        isDeregistered
          ? 'liquidationDescription'
          : isLiquidationSoon
            ? 'exitTimerDescriptionNow'
            : 'exitTimerDescription',
        {
          relativeTime,
          link: externalLink(URL.NODE_LIQUIDATION_LEARN_MORE),
        }
      )}
    >
      <NodeNotification level={isLiquidationSoon ? 'error' : 'warning'} className={className}>
        {isLiquidationSoon
          ? dictionary.rich('exitTimerNotificationNow')
          : dictionary.rich('exitTimerNotification', { relativeTime })}
      </NodeNotification>
    </Tooltip>
  );
};
export const ExitUnlockTimerNotification = ({
  date,
  timeString,
  className,
  isDeregistered,
}: {
  date: Date | null;
  timeString: string | null;
  isDeregistered?: boolean;
  className?: string;
}) => {
  const dictionary = useTranslations('nodeCard.staked');
  const dictionaryGeneral = useTranslations('general');
  const notFoundString = dictionaryGeneral('notFound');
  const soonString = dictionaryGeneral('soon');
  const formattedDate = useFormatDate(date, { dateStyle: 'full', timeStyle: 'short' });

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
      <NodeNotification level="warning" className={className}>
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
      </NodeNotification>
    </Tooltip>
  );
};
export const DeregisteringNotification = ({
  date,
  timeString,
}: {
  date: Date | null;
  timeString: string | null;
}) => {
  const { chainId } = useWallet();
  const dictionary = useTranslations('nodeCard.staked');
  const generalDictionary = useTranslations('general');
  const notFoundString = generalDictionary('notFound');
  const soonString = generalDictionary('soon');
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
      <NodeNotification level="error">
        {dictionary.rich('deregistrationTimerNotification', { relativeTime })}
      </NodeNotification>
    </Tooltip>
  );
};

type NodeSummaryProps = {
  node: Stake;
  state: STAKE_STATE;
  blockHeight: number;
  deregistrationDate: Date | null;
  deregistrationTime: string | null;
  requestedUnlockDate: Date | null;
  requestedUnlockTime: string | null;
  deregistrationUnlockDate: Date | null;
  deregistrationUnlockTime: string | null;
  liquidationDate: Date | null;
  liquidationTime: string | null;
  showAllTimers?: boolean;
  isOperator?: boolean;
  isInContractIdList?: boolean;
};

export const NodeSummary = ({
  node,
  state,
  blockHeight,
  deregistrationDate,
  deregistrationTime,
  requestedUnlockDate,
  requestedUnlockTime,
  deregistrationUnlockDate,
  deregistrationUnlockTime,
  liquidationDate,
  liquidationTime,
  isInContractIdList,
}: NodeSummaryProps) => {
  const eventState = parseStakeEventState(node);
  const isExited = eventState === STAKE_EVENT_STATE.EXITED;

  const contributors = (
    <NodeContributorList
      contributors={node.contributors}
      data-testid={StakedNodeDataTestId.Contributor_List}
    />
  );

  if (state === STAKE_STATE.DEREGISTERED) {
    return (
      <>
        {contributors}
        {!isExited && isInContractIdList ? (
          <ReadyForExitNotification
            timeString={liquidationTime}
            date={liquidationDate}
            isDeregistered
          />
        ) : (
          <ExitUnlockTimerNotification
            timeString={deregistrationUnlockTime}
            date={deregistrationUnlockDate}
            isDeregistered
          />
        )}
      </>
    );
  }

  if (isStakeRequestingExit(node)) {
    return (
      <>
        {contributors}
        {isExited || !isInContractIdList ? null : isReadyToExitByUnlock(
            state,
            eventState,
            node.requested_unlock_height,
            blockHeight
          ) ? (
          <ReadyForExitNotification date={liquidationDate} timeString={liquidationTime} />
        ) : (
          <ExitUnlockTimerNotification
            date={requestedUnlockDate}
            timeString={requestedUnlockTime}
          />
        )}
      </>
    );
  }

  if (state === STAKE_STATE.DECOMMISSIONED) {
    return <DeregisteringNotification date={deregistrationDate} timeString={deregistrationTime} />;
  }

  return contributors;
};
