import { NodeDeregisteringNotification } from '@/components/StakedNode/Notification/NodeDeregisteringNotification';
import { NodeExitUnlockTimerNotification } from '@/components/StakedNode/Notification/NodeExitUnlockTimerNotification';
import { NodeReadyForExitNotification } from '@/components/StakedNode/Notification/NodeReadyForExitNotification';
import { NodeVersionUpdateAvailableNotification } from '@/components/StakedNode/Notification/NodeVersionUpdateAvailableNotification';
import {
  STAKE_EVENT_STATE,
  STAKE_STATE,
  parseStakeEventState,
} from '@/components/StakedNode/state';
import { isReadyToExitByUnlock } from '@/components/StakedNodeCard';
import { VERSION } from '@/hooks/useNetworkVersionInfo';
import type { Stake } from '@session/staking-api-js/schema';
import { useMemo } from 'react';

type NodeSummaryProps = {
  blockHeight: number;
  deregistrationDate: Date | null;
  deregistrationUnlockDate: Date | null;
  isInContractIdList?: boolean;
  liquidationDate: Date | null;
  node: Stake;
  requestedUnlockDate: Date | null;
  state: STAKE_STATE;
  availableUpdate?: VERSION | null;
};

export const NodeNotification = ({
  blockHeight,
  deregistrationDate,
  deregistrationUnlockDate,
  isInContractIdList,
  liquidationDate,
  node,
  requestedUnlockDate,
  state,
  availableUpdate,
}: NodeSummaryProps) => {
  const eventState = useMemo(() => parseStakeEventState(node), [node]);
  const stakeRequestingExit = eventState === STAKE_EVENT_STATE.EXIT_REQUESTED;
  const isExited = eventState === STAKE_EVENT_STATE.EXITED;

  const showVersionNotification =
    availableUpdate === VERSION.MAJOR || availableUpdate === VERSION.MINOR;

  if (state === STAKE_STATE.DEREGISTERED) {
    return !isExited && isInContractIdList ? (
      <NodeReadyForExitNotification date={liquidationDate} isDeregistered />
    ) : (
      <NodeExitUnlockTimerNotification date={deregistrationUnlockDate} isDeregistered />
    );
  }

  if (stakeRequestingExit) {
    if (isExited || !isInContractIdList) {
      return null;
    }

    if (isReadyToExitByUnlock(state, eventState, node.requested_unlock_height, blockHeight)) {
      return <NodeReadyForExitNotification date={liquidationDate} />;
    }
    if (state === STAKE_STATE.DECOMMISSIONED) {
      return <NodeDeregisteringNotification date={deregistrationDate} />;
    }

    if (showVersionNotification) {
      return <NodeVersionUpdateAvailableNotification availableUpdate={availableUpdate} />;
    }

    return <NodeExitUnlockTimerNotification date={requestedUnlockDate} />;
  }

  if (state === STAKE_STATE.DECOMMISSIONED) {
    return <NodeDeregisteringNotification date={deregistrationDate} />;
  }

  if (state === STAKE_STATE.RUNNING && showVersionNotification) {
    return <NodeVersionUpdateAvailableNotification availableUpdate={availableUpdate} />;
  }

  return null;
};
