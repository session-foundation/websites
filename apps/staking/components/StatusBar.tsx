'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { Button } from '@session/ui/ui/button';
import { useToasterHistory } from '@session/ui/ui/sonner';
import { ListXIcon } from '@session/ui/icons/ListX';
import { ListChecksIcon } from '@session/ui/icons/ListChecks';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import type { NetworkInfo } from '@session/staking-api-js/client';
import { LAST_UPDATED_BEHIND_TRIGGER, PREFERENCE } from '@/lib/constants';
import { StatusIndicator } from '@session/ui/components/StatusIndicator';
import useRelativeTime from '@/hooks/useRelativeTime';
import { Tooltip } from '@session/ui/ui/tooltip';
import { useTranslations } from 'next-intl';
import { clickableText } from '@/lib/locale-defaults';
import { usePreferences } from 'usepref';

export function StatusBar() {
  const now = Date.now();
  const { toastHistory, showHistory, setShowHistory } = useToasterHistory();
  const { networkStatusVisible, networkInfo, networkInfoIsFetching, refetch } = useNetworkStatus();
  const dictionary = useTranslations('statusBar');

  const { getItem } = usePreferences();
  const showL2HeightOnStatusBarFlag = getItem<string>(PREFERENCE.SHOW_L2_HEIGHT_ON_STATUS_BAR);
  // TODO: a bug in usePref makes this a string, this will be fixed soon, at which point we can remove this and use a boolean
  const showL2HeightOnStatusBar = showL2HeightOnStatusBarFlag === 'true';

  const blockRelativeTime = useRelativeTime(
    networkInfo?.block_timestamp ? new Date(networkInfo?.block_timestamp * 1000) : undefined,
    { addSuffix: true }
  );

  const l2HeightRelativeTime = useRelativeTime(
    networkInfo?.l2_height_timestamp
      ? new Date(networkInfo?.l2_height_timestamp * 1000)
      : undefined,
    { addSuffix: true }
  );

  const showNetworkBehindWarning = networkInfo
    ? networkInfo.block_timestamp * 1000 + LAST_UPDATED_BEHIND_TRIGGER.BACKEND_LAST_BLOCK_WARNING <
      now
    : false;

  const showNetworkBehindError = networkInfo
    ? networkInfo.block_timestamp * 1000 + LAST_UPDATED_BEHIND_TRIGGER.BACKEND_LAST_BLOCK_ERROR <
      now
    : false;

  const showL2HeightBehindWarning = networkInfo
    ? networkInfo.l2_height_timestamp * 1000 +
        LAST_UPDATED_BEHIND_TRIGGER.BACKEND_L2_HEIGHT_WARNING <
      now
    : false;

  const showL2HeightBehindError = networkInfo
    ? networkInfo.l2_height_timestamp * 1000 + LAST_UPDATED_BEHIND_TRIGGER.BACKEND_L2_HEIGHT_ERROR <
      now
    : false;

  const handleClick = () => {
    if (
      !networkInfoIsFetching &&
      (showNetworkBehindError ||
        showNetworkBehindWarning ||
        showL2HeightBehindError ||
        showL2HeightBehindWarning ||
        !networkInfo ||
        !networkInfo.block_height ||
        !networkInfo.l2_height)
    ) {
      refetch();
    }
  };

  const networkStatusTextKey = networkInfoIsFetching
    ? 'network.loading'
    : showNetworkBehindError || (!showL2HeightOnStatusBar && showL2HeightBehindError)
      ? 'network.errorTooltip'
      : showNetworkBehindWarning || (!showL2HeightOnStatusBar && showL2HeightBehindWarning)
        ? 'network.warningTooltip'
        : networkInfo
          ? 'network.infoTooltip'
          : 'network.unreachableTooltip';

  const networkStatusIndicatorStatus = networkInfoIsFetching
    ? 'pending'
    : showNetworkBehindError || (!showL2HeightOnStatusBar && showL2HeightBehindError)
      ? 'red'
      : showNetworkBehindWarning || (!showL2HeightOnStatusBar && showL2HeightBehindWarning)
        ? 'yellow'
        : !networkInfo?.block_height || (!showL2HeightOnStatusBar && !networkInfo.l2_height)
          ? 'red'
          : 'green';

  const networkStatusIndicatorClassName = networkInfoIsFetching
    ? 'text-text-muted-foreground'
    : showNetworkBehindError || (!showL2HeightOnStatusBar && showL2HeightBehindError)
      ? 'text-destructive'
      : showNetworkBehindWarning || (!showL2HeightOnStatusBar && showL2HeightBehindWarning)
        ? 'text-warning'
        : !networkInfo?.block_height || (!showL2HeightOnStatusBar && !networkInfo.l2_height)
          ? 'text-destructive'
          : 'text-session-green';

  const l2HeightStatusTextKey = networkInfoIsFetching
    ? 'l2.loading'
    : showL2HeightBehindError
      ? 'l2.errorTooltip'
      : showL2HeightBehindWarning
        ? 'l2.warningTooltip'
        : networkInfo?.l2_height
          ? 'l2.infoTooltip'
          : 'l2.unreachableTooltip';

  const l2HeightStatusIndicatorStatus = networkInfoIsFetching
    ? 'pending'
    : showL2HeightBehindError
      ? 'red'
      : showL2HeightBehindWarning
        ? 'yellow'
        : networkInfo?.l2_height
          ? 'green'
          : 'red';

  const l2HeightStatusIndicatorClassName = networkInfoIsFetching
    ? 'text-text-muted-foreground'
    : showL2HeightBehindError
      ? 'text-destructive'
      : showL2HeightBehindWarning
        ? 'text-warning'
        : networkInfo?.l2_height
          ? 'text-session-green'
          : 'text-destructive';

  return (
    <div className="fixed bottom-2 z-[9999999999] mx-6 flex w-[90vw] flex-row items-end gap-2 md:right-6 md:w-auto">
      {toastHistory.length ? (
        <Button
          variant="ghost"
          size="icon"
          rounded="full"
          className="h-6 w-6 self-end"
          onClick={() => setShowHistory(!showHistory)}
          data-testid={ButtonDataTestId.Toggle_Show_Toaster_History}
        >
          {showHistory ? <ListXIcon className="h-4 w-4" /> : <ListChecksIcon className="h-4 w-4" />}
        </Button>
      ) : null}
      {networkStatusVisible && showL2HeightOnStatusBar ? (
        <Tooltip
          tooltipContent={dictionary.rich(l2HeightStatusTextKey, {
            height: networkInfo?.l2_height,
            heightRelativeTime: l2HeightRelativeTime,
            'clickable-text': clickableText(handleClick),
          })}
          triggerProps={{ onClick: handleClick }}
        >
          <div className="flex flex-row items-center gap-2">
            <StatusIndicator status={l2HeightStatusIndicatorStatus} />
            <span className={l2HeightStatusIndicatorClassName}>
              {networkInfoIsFetching
                ? dictionary('l2.loading')
                : networkInfo?.l2_height ?? dictionary('network.unreachable')}
            </span>
          </div>
        </Tooltip>
      ) : null}
      {networkStatusVisible ? (
        <Tooltip
          tooltipContent={
            <div className="flex flex-col gap-1.5">
              <span>
                {dictionary.rich(networkStatusTextKey, {
                  blockNumber: networkInfo?.block_height,
                  blockRelativeTime: blockRelativeTime,
                  'clickable-text': clickableText(handleClick),
                })}
              </span>
              {!showL2HeightOnStatusBar ? (
                <span>
                  {dictionary.rich(l2HeightStatusTextKey, {
                    height: networkInfo?.l2_height,
                    heightRelativeTime: l2HeightRelativeTime,
                    'clickable-text': clickableText(handleClick),
                  })}
                </span>
              ) : null}
            </div>
          }
          triggerProps={{ onClick: handleClick }}
        >
          <div className="flex flex-row items-center gap-2">
            <StatusIndicator status={networkStatusIndicatorStatus} />
            <span className={networkStatusIndicatorClassName}>
              {networkInfoIsFetching
                ? dictionary('network.loading')
                : networkInfo?.block_height ?? dictionary('network.unreachable')}
            </span>
          </div>
        </Tooltip>
      ) : null}
    </div>
  );
}

type StatusContext = {
  networkStatusVisible: boolean;
  setNetworkStatusVisible: (networkStatusVisible: boolean) => void;
  networkInfo: NetworkInfo | undefined;
  setNetworkInfo: (networkInfo: NetworkInfo | undefined) => void;
  networkInfoIsFetching: boolean;
  setNetworkInfoIsFetching: (networkInfoIsFetching: boolean) => void;
  refetch: () => void;
  setRefetch: (refetch: () => void) => void;
};

const StatusContext = createContext<StatusContext | undefined>(undefined);

export default function StatusBarProvider({ children }: { children?: ReactNode }) {
  const [networkStatusVisible, setNetworkStatusVisible] = useState<boolean>(false);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | undefined>(undefined);
  const [networkInfoIsFetching, setNetworkInfoIsFetching] = useState<boolean>(false);
  const [refetch, setRefetch] = useState<() => void>(() => {});

  return (
    <StatusContext.Provider
      value={{
        networkStatusVisible,
        setNetworkStatusVisible,
        networkInfo,
        setNetworkInfo,
        networkInfoIsFetching,
        setNetworkInfoIsFetching,
        refetch,
        setRefetch,
      }}
    >
      {children}
    </StatusContext.Provider>
  );
}

export function useNetworkStatus(
  networkInfo?: NetworkInfo | null,
  isFetching?: boolean,
  refetch?: () => void
) {
  const context = useContext(StatusContext);

  if (context === undefined) {
    throw new Error('useNetworkStatus must be used inside StatusBarProvider');
  }

  useEffect(() => {
    if (networkInfo) {
      context.setNetworkInfo(networkInfo);
    }
  }, [networkInfo, context.setNetworkInfo]);

  useEffect(() => {
    if (isFetching !== undefined) {
      context.setNetworkInfoIsFetching(isFetching);
    }
  }, [isFetching, context.setNetworkInfoIsFetching]);

  useEffect(() => {
    if (refetch) {
      context.setRefetch(() => refetch);
    }
  }, [refetch, context.setRefetch]);

  return context;
}
