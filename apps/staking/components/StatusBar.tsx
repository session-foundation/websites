'use client';

import useRelativeTime from '@/hooks/useRelativeTime';
import { LAST_UPDATED_BEHIND_TRIGGER, PREFERENCE } from '@/lib/constants';
import { clickableText } from '@/lib/locale-defaults';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import type { NetworkInfo } from '@session/staking-api-js/schema';
import { StatusIndicator } from '@session/ui/components/StatusIndicator';
import { ReactPortal, portalChildClassName } from '@session/ui/components/util/ReactPortal';
import { ListChecksIcon } from '@session/ui/icons/ListChecks';
import { ListXIcon } from '@session/ui/icons/ListX';
import { cn } from '@session/ui/lib/utils';
import { Button } from '@session/ui/ui/button';
import { useToasterHistory } from '@session/ui/ui/sonner';
import { Tooltip } from '@session/ui/ui/tooltip';
import { useBlockNumber } from '@session/wallet/hooks/useBlockNumber';
import { useTranslations } from 'next-intl';
import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePreferences } from 'usepref';

//biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex but readable
export function StatusBar() {
  const now = Date.now();
  const { toastHistory, showHistory, setShowHistory } = useToasterHistory();
  const {
    networkStatusVisible,
    networkInfo,
    networkInfoIsFetching,
    networkInfoIsLoading,
    refetch,
    lastFetchTimeStamp,
    l2BlockNumber,
  } = useNetworkStatus();
  const dictionary = useTranslations('statusBar');

  const { getItem } = usePreferences();
  const showL2HeightOnStatusBar = getItem<boolean>(PREFERENCE.SHOW_L2_HEIGHT_ON_STATUS_BAR);

  const blockRelativeTime = useRelativeTime(
    networkInfo?.block_timestamp ? new Date(networkInfo?.block_timestamp * 1000) : undefined,
    { addSuffix: true }
  );

  const l2HeightRelativeTime = useRelativeTime(
    lastFetchTimeStamp ? new Date(lastFetchTimeStamp) : undefined,
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
    ? (lastFetchTimeStamp ?? 0) + LAST_UPDATED_BEHIND_TRIGGER.BACKEND_L2_HEIGHT_WARNING < now
    : false;

  const showL2HeightBehindError = networkInfo
    ? (lastFetchTimeStamp ?? 0) + LAST_UPDATED_BEHIND_TRIGGER.BACKEND_L2_HEIGHT_ERROR < now
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
        !l2BlockNumber)
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
        : !networkInfo?.block_height || (!showL2HeightOnStatusBar && !l2BlockNumber)
          ? 'red'
          : 'green';

  const networkStatusIndicatorClassName = networkInfoIsFetching
    ? 'text-text-muted-foreground'
    : showNetworkBehindError || (!showL2HeightOnStatusBar && showL2HeightBehindError)
      ? 'text-destructive'
      : showNetworkBehindWarning || (!showL2HeightOnStatusBar && showL2HeightBehindWarning)
        ? 'text-warning'
        : !networkInfo?.block_height || (!showL2HeightOnStatusBar && !l2BlockNumber)
          ? 'text-destructive'
          : 'text-session-green';

  const l2HeightStatusTextKey = networkInfoIsFetching
    ? 'l2.loading'
    : showL2HeightBehindError
      ? 'l2.errorTooltip'
      : showL2HeightBehindWarning
        ? 'l2.warningTooltip'
        : l2BlockNumber
          ? 'l2.infoTooltip'
          : 'l2.unreachableTooltip';

  const l2HeightStatusIndicatorStatus = networkInfoIsFetching
    ? 'pending'
    : showL2HeightBehindError
      ? 'red'
      : showL2HeightBehindWarning
        ? 'yellow'
        : l2BlockNumber
          ? 'green'
          : 'red';

  const l2HeightStatusIndicatorClassName = networkInfoIsFetching
    ? 'text-text-muted-foreground'
    : showL2HeightBehindError
      ? 'text-destructive'
      : showL2HeightBehindWarning
        ? 'text-warning'
        : l2BlockNumber
          ? 'text-session-green'
          : 'text-destructive';

  return (
    <ReactPortal>
      <div
        className={cn(
          portalChildClassName,
          'fixed bottom-2 mx-6 flex w-[90vw] flex-row items-end gap-2 md:right-6 md:w-auto'
        )}
      >
        {toastHistory.length ? (
          <Button
            variant="ghost"
            size="icon"
            rounded="full"
            className="h-6 w-6 self-end"
            onClick={() => setShowHistory(!showHistory)}
            data-testid={ButtonDataTestId.Toggle_Show_Toaster_History}
          >
            {showHistory ? (
              <ListXIcon className="h-4 w-4" />
            ) : (
              <ListChecksIcon className="h-4 w-4" />
            )}
          </Button>
        ) : null}
        {networkStatusVisible && showL2HeightOnStatusBar ? (
          <Tooltip
            tooltipContent={dictionary.rich(l2HeightStatusTextKey, {
              height: l2BlockNumber?.toString(),
              heightRelativeTime: l2HeightRelativeTime,
              'clickable-text': clickableText(handleClick),
            })}
            triggerProps={{ onClick: handleClick }}
          >
            <div className="flex flex-row items-center gap-2">
              <StatusIndicator status={l2HeightStatusIndicatorStatus} />
              <span className={l2HeightStatusIndicatorClassName}>
                {networkInfoIsLoading
                  ? dictionary('l2.loading')
                  : (l2BlockNumber ?? dictionary('network.unreachable'))}
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
                      height: l2BlockNumber?.toString(),
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
                {networkInfoIsLoading
                  ? dictionary('network.loading')
                  : (networkInfo?.block_height ?? dictionary('network.unreachable'))}
              </span>
            </div>
          </Tooltip>
        ) : null}
      </div>
    </ReactPortal>
  );
}

type StatusContext = {
  networkStatusVisible: boolean;
  setNetworkStatusVisible: (networkStatusVisible: boolean) => void;
  networkInfo: NetworkInfo | undefined;
  setNetworkInfo: (networkInfo: NetworkInfo | undefined) => void;
  networkInfoIsFetching: boolean;
  setNetworkInfoIsFetching: (networkInfoIsFetching: boolean) => void;
  networkInfoIsLoading: boolean;
  setNetworkInfoIsLoading: (networkInfoIsLoading: boolean) => void;
  refetch: () => void;
  setRefetch: (refetch: () => void) => void;
  lastFetchTimeStamp: number | null;
  l2BlockNumber: bigint | undefined;
};

const StatusContext = createContext<StatusContext | undefined>(undefined);

export default function StatusBarProvider({ children }: { children?: ReactNode }) {
  const [networkStatusVisible, setNetworkStatusVisible] = useState<boolean>(false);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | undefined>(undefined);
  const [networkInfoIsFetching, setNetworkInfoIsFetching] = useState<boolean>(false);
  const [networkInfoIsLoading, setNetworkInfoIsLoading] = useState<boolean>(false);
  const [refetch, setRefetch] = useState<() => void>(() => {
    /* Do nothing */
  });

  const { data: l2BlockNumber, refetch: refetchL2BlockNumber } = useBlockNumber();

  const _refetch = () => {
    refetch();
    refetchL2BlockNumber();
  };

  const _setNetworkInfo = (networkInfo?: NetworkInfo) => {
    setNetworkInfo(networkInfo);
    refetchL2BlockNumber();
  };

  // biome-ignore  lint/correctness/useExhaustiveDependencies: We want this to update when the network info changes
  const lastFetchTimeStamp = useMemo(() => Date.now(), [networkInfo, l2BlockNumber]);

  return (
    <StatusContext.Provider
      value={{
        networkStatusVisible,
        setNetworkStatusVisible,
        networkInfo,
        setNetworkInfo: _setNetworkInfo,
        networkInfoIsFetching,
        networkInfoIsLoading,
        setNetworkInfoIsLoading,
        setNetworkInfoIsFetching,
        refetch: _refetch,
        setRefetch,
        lastFetchTimeStamp,
        l2BlockNumber,
      }}
    >
      {children}
    </StatusContext.Provider>
  );
}

type UseNetworkStatusParams = {
  network?: NetworkInfo | null;
  isLoading?: boolean;
  isFetching?: boolean;
  refetch?: () => void;
};

export function useNetworkStatus(params?: UseNetworkStatusParams) {
  const context = useContext(StatusContext);

  if (context === undefined) {
    throw new Error('useNetworkStatus must be used inside StatusBarProvider');
  }

  const { network, refetch, isLoading, isFetching } = params ?? {};

  useEffect(() => {
    if (network) {
      context.setNetworkInfo(network);
    }
  }, [network, context.setNetworkInfo]);

  useEffect(() => {
    if (isFetching !== undefined) {
      context.setNetworkInfoIsFetching(isFetching);
    }
  }, [isFetching, context.setNetworkInfoIsFetching]);

  useEffect(() => {
    if (isLoading !== undefined) {
      context.setNetworkInfoIsLoading(isLoading);
    }
  }, [isLoading, context.setNetworkInfoIsLoading]);

  useEffect(() => {
    if (refetch) {
      context.setRefetch(() => refetch);
    }
  }, [refetch, context.setRefetch]);

  return context;
}
