import {
  CONTRIBUTION_CONTRACT_STATUS,
  type ContributorContractInfo,
  EXIT_TYPE,
  type Stake,
} from '@session/staking-api-js/client';

enum EVENT {
  /** Emitted when a new service node is added to the network */
  NewServiceNodeV2 = 'NewServiceNodeV2',
  /** Emitted when a service node exit request is initiated */
  ServiceNodeExitRequest = 'ServiceNodeExitRequest',
  /** Emitted when a service node exits (by request or liquidation) */
  ServiceNodeExit = 'ServiceNodeExit',
  /** Emitted when a service node is liquidated NOTE: Always followed by ServiceNodeExit */
  ServiceNodeLiquidated = 'ServiceNodeLiquidated',
}

export enum STAKE_EVENT_STATE {
  UNKNOWN,
  ACTIVE,
  EXIT_REQUESTED,
  EXITED,
}

export function parseStakeEventState(stake: Stake) {
  const latestEvent =
    stake && 'events' in stake && Array.isArray(stake.events) ? stake?.events[0] : undefined;

  if (!latestEvent) return STAKE_EVENT_STATE.UNKNOWN;

  switch (latestEvent.name) {
    case EVENT.NewServiceNodeV2:
      return STAKE_EVENT_STATE.ACTIVE;
    case EVENT.ServiceNodeExitRequest:
      return STAKE_EVENT_STATE.EXIT_REQUESTED;
    case EVENT.ServiceNodeExit:
    case EVENT.ServiceNodeLiquidated:
      return STAKE_EVENT_STATE.EXITED;
    default:
      return STAKE_EVENT_STATE.UNKNOWN;
  }
}

export enum STAKE_STATE {
  /** @see {STAKE_EVENT_STATE.EXITED}
   *
   * To determine if the stake was exited by `unlock` or `deregistration`, use {@link isStakeDeregistered}
   * */
  EXITED = 'Exited',
  /** @see {STAKE_EVENT_STATE.EXIT_REQUESTED} */
  AWAITING_EXIT = 'Awaiting Exit',
  /**
   * If a stake is in the `deregistered` state, it means that the node has been deregistered by the network. All states are mutually exclusive, so it can't also be {@link STAKE_STATE.EXITED}.
   */
  DEREGISTERED = 'Deregistered',
  /** @see {STAKE_EVENT_STATE.ACTIVE}
   * and`active = true */
  RUNNING = 'Running',
  /** @see {STAKE_EVENT_STATE.ACTIVE}
   * and`active = false */
  DECOMMISSIONED = 'Decommissioned',
  /** Unknown state */
  UNKNOWN = 'Unknown',
}

export function isStakeDeregistered(stake: Stake) {
  return !!(
    stake.exit_type === EXIT_TYPE.DEREGISTER &&
    stake.deregistration_height &&
    stake.deregistration_height > 0
  );
}

export function isStakeRequestingExit(stake: Stake) {
  const eventState = parseStakeEventState(stake);
  return eventState === STAKE_EVENT_STATE.EXIT_REQUESTED;
}

export function isStakeReadyToExit(stake: Stake, blockHeight: number) {
  const eventState = parseStakeEventState(stake);
  return (
    eventState === STAKE_EVENT_STATE.EXIT_REQUESTED &&
    stake.requested_unlock_height &&
    stake.requested_unlock_height < blockHeight
  );
}

export function parseStakeState(stake: Stake, blockHeight: number) {
  const eventState = parseStakeEventState(stake);

  if (isStakeDeregistered(stake)) {
    return STAKE_STATE.DEREGISTERED;
  }

  if (eventState === STAKE_EVENT_STATE.EXITED) {
    return STAKE_STATE.EXITED;
  }

  if (eventState === STAKE_EVENT_STATE.EXIT_REQUESTED) {
    return isStakeReadyToExit(stake, blockHeight) ? STAKE_STATE.AWAITING_EXIT : STAKE_STATE.RUNNING;
  }

  if (eventState === STAKE_EVENT_STATE.ACTIVE) {
    return stake.active ? STAKE_STATE.RUNNING : STAKE_STATE.DECOMMISSIONED;
  }

  return STAKE_STATE.UNKNOWN;
}

export enum STAKE_CONTRACT_STATE {
  AWAITING_OPERATOR_ACTIVATION = 'Awaiting Operator Activation',
  // NOTE: only show a joining contract if there is no related stake from the stakes list
  JOINING = 'Joining',
  AWAITING_CONTRIBUTORS = 'Awaiting Contributors',
  AWAITING_OPERATOR_CONTRIBUTION = 'Awaiting Operator Contribution',
  UNKNOWN = 'Unknown',
}

export function parseStakeContractState(contract: ContributorContractInfo) {
  switch (contract.status) {
    case CONTRIBUTION_CONTRACT_STATUS.WaitForOperatorContrib:
      return STAKE_CONTRACT_STATE.AWAITING_OPERATOR_CONTRIBUTION;
    case CONTRIBUTION_CONTRACT_STATUS.OpenForPublicContrib:
      return STAKE_CONTRACT_STATE.AWAITING_CONTRIBUTORS;
    case CONTRIBUTION_CONTRACT_STATUS.WaitForFinalized:
      return STAKE_CONTRACT_STATE.AWAITING_OPERATOR_ACTIVATION;
    case CONTRIBUTION_CONTRACT_STATUS.Finalized:
      return STAKE_CONTRACT_STATE.JOINING;
    default:
      return STAKE_CONTRACT_STATE.UNKNOWN;
  }
}
