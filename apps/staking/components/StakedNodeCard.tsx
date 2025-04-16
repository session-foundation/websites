"use client";

import { ActionModuleDivider } from "@/components/ActionModule";
import { NodeExitButton } from "@/components/StakedNode/NodeExitButton";
import { NodeExitButtonDialog } from "@/components/StakedNode/NodeExitButtonDialog";
import { NodeRequestExitButton } from "@/components/StakedNode/NodeRequestExitButton";
import { StakeCard } from "@/components/StakedNode/StakeCard";
import {
  STAKE_EVENT_STATE,
  STAKE_STATE,
  isStakeRequestingExit,
  parseStakeEventState,
  parseStakeState,
} from "@/components/StakedNode/state";
import { getTotalStakedAmountForAddressFormatted } from "@/components/getTotalStakedAmountForAddressFormatted";
import useRelativeTime from "@/hooks/useRelativeTime";
import { useStakes } from "@/hooks/useStakes";
import {
  SESSION_NODE,
  SESSION_NODE_TIME,
  SESSION_NODE_TIME_STATIC,
  URL,
} from "@/lib/constants";
import { FEATURE_FLAG } from "@/lib/feature-flags";
import { useFeatureFlag } from "@/lib/feature-flags-client";
import {
  formatLocalizedTimeFromSeconds,
  formatNumber,
  formatPercentage,
  useFormatDate,
} from "@/lib/locale-client";
import { externalLink } from "@/lib/locale-defaults";
import {
  ButtonDataTestId,
  LinkDataTestId,
  NodeCardDataTestId,
  StakedNodeDataTestId,
} from "@/testing/data-test-ids";
import type { Stake } from "@session/staking-api-js/schema";
import { CopyToClipboardButton } from "@session/ui/components/CopyToClipboardButton";
import { PubKey } from "@session/ui/components/PubKey";
import type { statusVariants } from "@session/ui/components/StatusIndicator";
import { SpannerAndScrewdriverIcon } from "@session/ui/icons/SpannerAndScrewdriverIcon";
import { cn } from "@session/ui/lib/utils";
import { Tooltip } from "@session/ui/ui/tooltip";
import { areHexesEqual } from "@session/util-crypto/string";
import { jsonBigIntReplacer } from "@session/util-js/bigint";
import { getDateFromUnixTimestampSeconds } from "@session/util-js/date";
import { useWallet } from "@session/wallet/hooks/useWallet";
import type { VariantProps } from "class-variance-authority";
import { useTranslations } from "next-intl";
import { type HTMLAttributes, forwardRef, useMemo } from "react";
import type { Address } from "viem";
import { CollapsableContent, NodeContributorList, RowLabel } from "./NodeCard";

/**
 * Checks if a given stake is ready to exit the smart contract.
 * @param state - The stake state.
 * @param eventState - The stake event state.
 * @param unlockHeight - The unlock height.
 * @param blockHeight - The current block height.
 */
export const isReadyToExitByUnlock = (
  state: STAKE_STATE,
  eventState: STAKE_EVENT_STATE,
  unlockHeight?: number,
  blockHeight?: number
) =>
  !!(
    state === STAKE_STATE.AWAITING_EXIT &&
    eventState !== STAKE_EVENT_STATE.EXITED &&
    unlockHeight &&
    blockHeight &&
    unlockHeight <= blockHeight
  );

function getNodeStatus(
  state: STAKE_STATE
): VariantProps<typeof statusVariants>["status"] {
  switch (state) {
    case STAKE_STATE.RUNNING:
      return "green";
    case STAKE_STATE.DECOMMISSIONED:
      return "yellow";
    case STAKE_STATE.DEREGISTERED:
      return "red";
    default:
      return "grey";
  }
}

const blocksInMs = (blocks: number) => blocks * SESSION_NODE.MS_PER_BLOCK;
const msInBlocks = (ms: number) => Math.floor(ms / SESSION_NODE.MS_PER_BLOCK);

class BlockTimeManager {
  private readonly networkTime: number;
  private readonly currentBlock: number;

  constructor(networkTime: number, currentBlock: number) {
    this.networkTime = networkTime;
    this.currentBlock = currentBlock;
  }

  getDateOfBlock(targetBlock: number) {
    return new Date(
      this.networkTime * 1000 + blocksInMs(targetBlock - this.currentBlock)
    );
  }
}

type NodeNotificationProps = HTMLAttributes<HTMLSpanElement> & {
  level?: "info" | "warning" | "error";
};

const NodeNotification = forwardRef<HTMLSpanElement, NodeNotificationProps>(
  ({ className, children, level, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "flex w-3/4 flex-row gap-2 font-normal text-xs sm:w-max md:text-base",
        level === "warning"
          ? "text-warning"
          : level === "error"
          ? "text-destructive"
          : "text-session-text",
        className
      )}
      {...props}
    >
      <span>•</span>
      {children}
    </span>
  )
);

type NodeOperatorIndicatorProps = HTMLAttributes<HTMLDivElement> & {
  isOperatorConnectedWallet?: boolean;
};

export const NodeOperatorIndicator = forwardRef<
  HTMLDivElement,
  NodeOperatorIndicatorProps
>(({ className, isOperatorConnectedWallet, ...props }, ref) => {
  const dictionary = useTranslations("nodeCard.staked");
  return (
    <Tooltip
      tooltipContent={
        isOperatorConnectedWallet
          ? dictionary("operatorTooltip")
          : dictionary("operatorTooltipOther")
      }
    >
      <div
        ref={ref}
        className={cn(
          "flex flex-row items-center gap-1 align-middle font-normal text-session-green text-sm md:text-base",
          className
        )}
        {...props}
      >
        <SpannerAndScrewdriverIcon className="h-3.5 w-3.5 fill-session-green" />
      </div>
    </Tooltip>
  );
});

/**
 * Checks if a given date is in the past or `soon`
 * @see {@link SESSION_NODE_TIME_STATIC.SOON_TIME}
 * @param date - The date to check.
 * @returns `true` if the date is in the past or `soon`, `false` otherwise.
 */
const isDateSoonOrPast = (date: Date | null): boolean =>
  !!(date && Date.now() > date.getTime() - SESSION_NODE_TIME_STATIC.SOON_TIME);

const ReadyForExitNotification = ({
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
  const dictionary = useTranslations("nodeCard.staked");
  const dictionaryGeneral = useTranslations("general");
  const soonString = dictionaryGeneral("soon");

  const isLiquidationSoon = useMemo(() => isDateSoonOrPast(date), [date]);
  const relativeTime = useMemo(
    () => (!isLiquidationSoon ? timeString : soonString) ?? "",
    [isLiquidationSoon, timeString, soonString]
  );

  return (
    <Tooltip
      tooltipContent={dictionary.rich(
        isDeregistered
          ? "liquidationDescription"
          : isLiquidationSoon
          ? "exitTimerDescriptionNow"
          : "exitTimerDescription",
        {
          relativeTime,
          link: externalLink({
            href: URL.NODE_LIQUIDATION_LEARN_MORE,
            dataTestId: LinkDataTestId.Exit_Timer_Liquidation_Learn_More,
          }),
        }
      )}
    >
      <NodeNotification
        level={isLiquidationSoon ? "error" : "warning"}
        className={className}
      >
        {isLiquidationSoon
          ? dictionary(
              isDeregistered
                ? "liquidationNotification"
                : "exitTimerNotificationNow"
            )
          : dictionary(
              isDeregistered
                ? "deregistrationTimerDescription"
                : "exitTimerNotification",
              { relativeTime }
            )}
      </NodeNotification>
    </Tooltip>
  );
};

const ExitUnlockTimerNotification = ({
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
  const dictionary = useTranslations("nodeCard.staked");
  const dictionaryGeneral = useTranslations("general");
  const notFoundString = dictionaryGeneral("notFound");
  const soonString = dictionaryGeneral("soon");
  const formattedDate = useFormatDate(date, {
    dateStyle: "full",
    timeStyle: "short",
  });

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
      tooltipContent={dictionary(
        isDeregistered
          ? "deregisteredTimerDescription"
          : "exitUnlockTimerDescription",
        {
          relativeTime,
          date: formattedDate ?? notFoundString,
        }
      )}
    >
      <NodeNotification level="warning" className={className}>
        {relativeTime
          ? dictionary(
              isDeregistered
                ? "deregisteredTimerNotification"
                : "exitUnlockTimerNotification",
              {
                relativeTime,
              }
            )
          : dictionary(
              isDeregistered
                ? "deregisteredProcessing"
                : "exitUnlockTimerProcessing"
            )}
      </NodeNotification>
    </Tooltip>
  );
};

const DeregisteringNotification = ({
  date,
  timeString,
}: {
  date: Date | null;
  timeString: string | null;
}) => {
  const { chainId } = useWallet();
  const dictionary = useTranslations("nodeCard.staked");
  const generalDictionary = useTranslations("general");
  const notFoundString = generalDictionary("notFound");
  const soonString = generalDictionary("soon");
  const formattedDate = useFormatDate(date, {
    dateStyle: "full",
    timeStyle: "short",
  });

  const isDeregistrationSoon = isDateSoonOrPast(date);
  const relativeTime = useMemo(
    () => (!isDeregistrationSoon ? timeString : soonString) ?? notFoundString,
    [isDeregistrationSoon, timeString, soonString, notFoundString]
  );

  return (
    <Tooltip
      tooltipContent={dictionary("deregistrationTimerDescription", {
        lockedStakeTime: formatLocalizedTimeFromSeconds(
          SESSION_NODE_TIME(chainId).DEREGISTRATION_LOCKED_STAKE_SECONDS,
          { unit: "day" }
        ),
        relativeTime,
        date: formattedDate ?? notFoundString,
      })}
    >
      <NodeNotification level="error">
        {dictionary("deregistrationTimerNotification", { relativeTime })}
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

const NodeSummary = ({
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
          <ReadyForExitNotification
            date={liquidationDate}
            timeString={liquidationTime}
          />
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
    return (
      <DeregisteringNotification
        date={deregistrationDate}
        timeString={deregistrationTime}
      />
    );
  }

  return contributors;
};

const useNodeDates = (
  node: Stake,
  currentBlock: number,
  networkTime: number
) => {
  const { chainId } = useWallet();
  const blockTime = new BlockTimeManager(networkTime, currentBlock);
  const {
    last_reward_block_height: lastRewardBlock,
    last_uptime_proof: lastUptimeProofSeconds,
    earned_downtime_blocks: earnedDowntimeBlocks,
    requested_unlock_height: requestedUnlockBlock,
    deregistration_height: deregistrationHeight,
    liquidation_height: liquidationBlock,
  } = node;

  return useMemo(() => {
    const lastUptimeDate = lastUptimeProofSeconds
      ? getDateFromUnixTimestampSeconds(lastUptimeProofSeconds)
      : null;

    const deregistrationDate = earnedDowntimeBlocks
      ? blockTime.getDateOfBlock(currentBlock + earnedDowntimeBlocks)
      : null;

    const lastRewardDate = lastRewardBlock
      ? blockTime.getDateOfBlock(lastRewardBlock)
      : null;

    const requestedUnlockDate = requestedUnlockBlock
      ? blockTime.getDateOfBlock(requestedUnlockBlock)
      : null;

    const deregistrationUnlockBlock = deregistrationHeight
      ? deregistrationHeight +
        msInBlocks(
          SESSION_NODE_TIME(chainId).DEREGISTRATION_LOCKED_STAKE_SECONDS * 1000
        )
      : null;

    const deregistrationUnlockDate = deregistrationUnlockBlock
      ? blockTime.getDateOfBlock(deregistrationUnlockBlock)
      : null;

    const liquidationDate = liquidationBlock
      ? blockTime.getDateOfBlock(liquidationBlock)
      : null;

    return {
      lastUptimeDate,
      deregistrationDate,
      lastRewardDate,
      requestedUnlockDate,
      deregistrationUnlockDate,
      liquidationDate,
    };
  }, [
    chainId,
    blockTime,
    currentBlock,
    earnedDowntimeBlocks,
    lastUptimeProofSeconds,
    lastRewardBlock,
    requestedUnlockBlock,
    deregistrationHeight,
    liquidationBlock,
  ]);
};

const StakedNodeCard = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    id: string;
    stake: Stake;
    targetWalletAddress?: Address;
    blockHeight: number;
    networkTime: number;
    hideButton?: boolean;
  }
>(
  (
    {
      stake,
      blockHeight,
      networkTime,
      hideButton,
      targetWalletAddress,
      ...props
    },
    ref
  ) => {
    const dictionary = useTranslations("nodeCard.staked");
    const generalDictionary = useTranslations("general");
    const generalNodeDictionary = useTranslations("sessionNodes.general");
    const stakingNodeDictionary = useTranslations("sessionNodes.staking");
    const titleFormat = useTranslations("modules.title");
    const notFoundString = generalDictionary("notFound");

    const { address: connectedAddress } = useWallet();

    const address = targetWalletAddress ?? connectedAddress;

    const { networkContractIds } = useStakes(address);
    const isInContractIdList = networkContractIds?.has(stake.contract_id);

    const {
      operator_fee: fee,
      operator_address: operatorAddress,
      contributors,
      last_reward_block_height: lastRewardBlock,
      last_uptime_proof: lastUptimeProofSeconds,
    } = stake;

    const formattedStakedBalance = getTotalStakedAmountForAddressFormatted(
      contributors,
      address
    );
    const showRawNodeData = useFeatureFlag(FEATURE_FLAG.SHOW_NODE_RAW_DATA);

    const beneficiaryAddress = useMemo(() => {
      if (!address) return null;

      const contributor = contributors.find((contributor) =>
        areHexesEqual(contributor.address, address)
      );
      if (!contributor || !contributor.beneficiary) return null;

      return !areHexesEqual(contributor.beneficiary, contributor.address)
        ? contributor.beneficiary
        : null;
    }, [contributors, address]);

    const {
      lastUptimeDate,
      deregistrationDate,
      lastRewardDate,
      requestedUnlockDate,
      deregistrationUnlockDate,
      liquidationDate,
    } = useNodeDates(stake, blockHeight, networkTime);

    const formattedLastRewardDate = useFormatDate(lastRewardDate, {
      dateStyle: "full",
      timeStyle: "short",
    });
    const formattedLastUptimeDate = useFormatDate(lastUptimeDate, {
      dateStyle: "full",
      timeStyle: "short",
    });

    const lastRewardTime = useRelativeTime(lastRewardDate, { addSuffix: true });
    const deregistrationTime = useRelativeTime(deregistrationDate, {
      addSuffix: true,
    });
    const lastUptimeTime = useRelativeTime(lastUptimeDate, { addSuffix: true });
    const requestedUnlockTime = useRelativeTime(requestedUnlockDate, {
      addSuffix: true,
    });
    const deregistrationUnlockTime = useRelativeTime(deregistrationUnlockDate, {
      addSuffix: true,
    });
    const liquidationTime = useRelativeTime(liquidationDate, {
      addSuffix: true,
    });

    const isSoloNode = contributors.length === 1;

    const state = parseStakeState(stake, blockHeight);

    return (
      <StakeCard
        ref={ref}
        {...props}
        data-testid={NodeCardDataTestId.Staked_Node}
        title={state}
        statusIndicatorColor={getNodeStatus(state)}
        publicKey={stake.service_node_pubkey}
        isOperator={areHexesEqual(stake.operator_address, address)}
        summary={
          <NodeSummary
            node={stake}
            state={state}
            blockHeight={blockHeight}
            isInContractIdList={isInContractIdList}
            deregistrationDate={deregistrationDate}
            deregistrationTime={deregistrationTime}
            deregistrationUnlockDate={deregistrationUnlockDate}
            deregistrationUnlockTime={deregistrationUnlockTime}
            liquidationDate={liquidationDate}
            liquidationTime={liquidationTime}
            requestedUnlockTime={requestedUnlockTime}
            requestedUnlockDate={requestedUnlockDate}
          />
        }
        collapsableFirstChildren={
          <>
            {state === STAKE_STATE.DECOMMISSIONED &&
            stake.requested_unlock_height ? (
              <CollapsableContent className="text-warning" size="xs">
                <ExitUnlockTimerNotification
                  date={requestedUnlockDate}
                  timeString={requestedUnlockTime}
                  className="md:text-xs"
                />
              </CollapsableContent>
            ) : null}
            {state !== STAKE_STATE.RUNNING ? (
              <CollapsableContent size="xs">
                <Tooltip
                  tooltipContent={dictionary("lastRewardDescription", {
                    blockNumber: lastRewardBlock
                      ? formatNumber(lastRewardBlock)
                      : notFoundString,
                    date: formattedLastRewardDate ?? notFoundString,
                  })}
                >
                  <span className="font-normal text-gray-lightest">
                    {dictionary("lastReward", {
                      relativeTime: lastRewardTime ?? notFoundString,
                    })}
                  </span>
                </Tooltip>
              </CollapsableContent>
            ) : null}
            {lastUptimeProofSeconds || state === STAKE_STATE.RUNNING ? (
              <CollapsableContent size="xs">
                <Tooltip
                  tooltipContent={dictionary("lastUptimeDescription", {
                    blockNumber: lastUptimeProofSeconds
                      ? formatNumber(
                          blockHeight -
                            msInBlocks(
                              Date.now() - lastUptimeProofSeconds * 1000
                            )
                        )
                      : notFoundString,
                    date: formattedLastUptimeDate ?? notFoundString,
                  })}
                >
                  <span className="font-normal text-gray-lightest">
                    {dictionary("lastUptime", {
                      relativeTime: lastUptimeTime ?? notFoundString,
                    })}
                  </span>
                </Tooltip>
              </CollapsableContent>
            ) : null}
          </>
        }
        collapsableLastChildren={
          <>
            <CollapsableContent className="peer-checked:max-h-12 sm:gap-1 sm:peer-checked:max-h-5">
              <RowLabel>
                {titleFormat("format", {
                  title: generalNodeDictionary("operatorAddress"),
                })}
              </RowLabel>
              <PubKey pubKey={operatorAddress} expandOnHoverDesktopOnly />
            </CollapsableContent>
            {beneficiaryAddress ? (
              <CollapsableContent className="peer-checked:max-h-12 sm:gap-1 sm:peer-checked:max-h-5">
                <RowLabel>
                  {titleFormat("format", {
                    title: generalNodeDictionary("beneficiaryAddress"),
                  })}
                </RowLabel>
                <PubKey pubKey={beneficiaryAddress} expandOnHoverDesktopOnly />
              </CollapsableContent>
            ) : null}
            <CollapsableContent>
              <RowLabel>
                {titleFormat("format", {
                  title: stakingNodeDictionary("stakedBalance"),
                })}
              </RowLabel>
              {formattedStakedBalance}
              <CopyToClipboardButton
                textToCopy={formattedStakedBalance}
                data-testid={ButtonDataTestId.Staked_Node_Copy_Staked_Balance}
              />
            </CollapsableContent>
            {!isSoloNode ? (
              <CollapsableContent>
                <RowLabel>
                  {titleFormat("format", {
                    title: generalNodeDictionary("operatorFee"),
                  })}
                </RowLabel>
                {fee !== null
                  ? formatPercentage(fee / 1_000_000)
                  : notFoundString}
              </CollapsableContent>
            ) : null}
            {showRawNodeData ? (
              <>
                <CollapsableContent className="hidden peer-checked:block">
                  <RowLabel>
                    {titleFormat("format", {
                      title: generalNodeDictionary("rawData"),
                    })}
                  </RowLabel>
                </CollapsableContent>
                <CollapsableContent
                  className="hidden peer-checked:block peer-checked:h-2"
                  size="xs"
                >
                  <ActionModuleDivider className="h-0.5" />
                </CollapsableContent>
                {Object.entries(stake).map(([key, value]) => {
                  const valueToDisplay = JSON.stringify(
                    value,
                    jsonBigIntReplacer
                  );
                  return (
                    <CollapsableContent
                      size="xs"
                      key={key}
                      className={cn(
                        "hidden peer-checked:block",
                        valueToDisplay.length > 100
                          ? "peer-checked:max-h-8"
                          : ""
                      )}
                    >
                      <RowLabel>{`${key}: `}</RowLabel>
                      <span>{valueToDisplay}</span>
                    </CollapsableContent>
                  );
                })}
              </>
            ) : null}
            {!hideButton ? (
              <StakeNodeCardButton
                stake={stake}
                state={state}
                blockHeight={blockHeight}
                requestedUnlockDate={requestedUnlockDate}
                requestedUnlockTime={requestedUnlockTime}
                notFoundString={notFoundString}
              />
            ) : null}
          </>
        }
      />
    );
  }
);
StakedNodeCard.displayName = "StakedNodeCard";

function StakeNodeCardButton({
  stake,
  state,
  blockHeight,
  notFoundString,
  requestedUnlockDate,
  requestedUnlockTime,
}: {
  stake: Stake;
  state: STAKE_STATE;
  blockHeight: number;
  requestedUnlockDate?: Date | null;
  requestedUnlockTime?: string | null;
  notFoundString?: string;
}) {
  const dictionary = useTranslations("nodeCard.staked");
  const formattedReqUnlockDate = useFormatDate(requestedUnlockDate, {
    dateStyle: "full",
    timeStyle: "short",
  });

  const eventState = parseStakeEventState(stake);

  if (
    state === STAKE_STATE.EXITED ||
    eventState === STAKE_EVENT_STATE.EXITED ||
    state === STAKE_STATE.DEREGISTERED
  ) {
    return null;
  }

  if (
    isReadyToExitByUnlock(
      state,
      eventState,
      stake.requested_unlock_height,
      blockHeight
    )
  ) {
    return <NodeExitButtonDialog node={stake} />;
  }

  if (state === STAKE_STATE.RUNNING) {
    if (isStakeRequestingExit(stake)) {
      return (
        <Tooltip
          tooltipContent={dictionary("exit.disabledButtonTooltipContent", {
            relativeTime: requestedUnlockTime ?? notFoundString,
            date: formattedReqUnlockDate ?? notFoundString,
          })}
        >
          <NodeExitButton disabled />
        </Tooltip>
      );
    }
    return <NodeRequestExitButton node={stake} />;
  }
}

export { StakedNodeCard };
