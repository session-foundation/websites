'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { Button } from '@session/ui/ui/button';
import { useToasterHistory } from '@session/ui/ui/sonner';
import { ListXIcon } from '@session/ui/icons/ListX';
import { ListChecksIcon } from '@session/ui/icons/ListChecks';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import type { NetworkInfo } from '@session/staking-api-js/client';
import { LAST_UPDATED_BEHIND_TRIGGER } from '@/lib/constants';
import { cn } from '@session/ui/lib/utils';
import { StatusIndicator } from '@session/ui/components/StatusIndicator';
import useRelativeTime from '@/hooks/useRelativeTime';
import { Tooltip } from '@session/ui/ui/tooltip';
import { useTranslations } from 'next-intl';
import { clickableText } from '@/lib/locale-defaults';

export function StatusBar() {
  const now = Date.now();
  const { toastHistory, showHistory, setShowHistory } = useToasterHistory();
  const { networkStatusVisible, networkInfo, networkInfoIsFetching, refetch } = useNetworkStatus();
  const dictionary = useTranslations('statusBar');

  const blockRelativeTime = useRelativeTime(
    networkInfo?.block_timestamp ? new Date(networkInfo?.block_timestamp * 1000) : undefined,
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

  const handleClick = () => {
    if (
      !networkInfoIsFetching &&
      (showNetworkBehindError || showNetworkBehindWarning || !networkInfo)
    ) {
      refetch();
    }
  };

  return (
    <div className="absolute bottom-2 z-[9999999999] mx-6 flex w-[90vw] flex-row items-end gap-2 md:right-6 md:w-auto">
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
      {networkStatusVisible ? (
        <Tooltip
          tooltipContent={dictionary.rich(
            networkInfoIsFetching
              ? 'loading'
              : showNetworkBehindError
                ? 'network.errorTooltip'
                : showNetworkBehindWarning
                  ? 'network.warningTooltip'
                  : networkInfo
                    ? 'network.infoTooltip'
                    : 'network.unreachableTooltip',
            {
              blockNumber: networkInfo?.block_height,
              relativeTime: blockRelativeTime,
              'clickable-text': clickableText(handleClick),
            }
          )}
          triggerProps={{
            onClick: handleClick,
          }}
        >
          <div className="flex flex-row items-center gap-1">
            <StatusIndicator
              status={
                networkInfoIsFetching
                  ? 'pending'
                  : showNetworkBehindError
                    ? 'red'
                    : showNetworkBehindWarning
                      ? 'yellow'
                      : networkInfo
                        ? 'green'
                        : 'red'
              }
            />
            <span
              className={cn(
                networkInfoIsFetching
                  ? 'text-text-muted-foreground'
                  : showNetworkBehindError
                    ? 'text-destructive'
                    : showNetworkBehindWarning
                      ? 'text-warning'
                      : networkInfo
                        ? 'text-session-green'
                        : 'text-destructive'
              )}
            >
              {networkInfoIsFetching
                ? dictionary('loading')
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
  networkInfo?: NetworkInfo,
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
  }, [networkInfo]);

  useEffect(() => {
    if (isFetching !== undefined) {
      context.setNetworkInfoIsFetching(isFetching);
    }
  }, [isFetching]);

  useEffect(() => {
    if (refetch) {
      context.setRefetch(() => refetch);
    }
  }, [refetch]);

  return context;
}
