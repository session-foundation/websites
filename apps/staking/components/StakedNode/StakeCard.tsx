import { NodeCard, NodeCardTitle } from '@/components/NodeCard';
import { StakedNodeDataTestId } from '@/testing/data-test-ids';
import {
  StatusIndicator,
  type StatusIndicatorVariants,
} from '@session/ui/components/StatusIndicator';
import { type HTMLAttributes, type ReactNode, forwardRef } from 'react';
import type { Address } from 'viem';

type StakeCardProps = HTMLAttributes<HTMLDivElement> & {
  toggleId: string;
  'data-testid': string;
  title: string;
  statusIndicatorColor: StatusIndicatorVariants['status'];
  operatorAddress?: Address;
  isDetailedView?: boolean;
};

const StakeCard = forwardRef<HTMLDivElement, StakeCardProps>(
  (
    {
      className,
      toggleId,
      statusIndicatorColor,
      title,
      operatorAddress,
      isDetailedView,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <NodeCard ref={ref} {...props} className={className} data-testid={props['data-testid']}>
        {!isDetailedView ? (
          <input id={toggleId} type="checkbox" className="peer hidden appearance-none" />
        ) : null}
        <StatusIndicator
          status={statusIndicatorColor}
          data-testid={StakedNodeDataTestId.Indicator}
        />
        <NodeCardTitle className="mx-1" data-testid={StakedNodeDataTestId.Title}>
          {title}
        </NodeCardTitle>
        {children}
      </NodeCard>
    );
  }
);
StakeCard.displayName = 'StakeCard';

export type OrderableComponents =
  | 'status'
  | 'contributors'
  | 'notification'
  | 'snKey'
  | 'version'
  | 'unlockTimer'
  | 'updateSmall'
  | 'rewardTimer'
  | 'uptimeTimer'
  | 'operatorAddress'
  | 'beneficiaryAddress'
  | 'stake'
  | 'fee'
  | 'actionButton'
  | 'expandButton';

export enum VIEW_MODE {
  SIMPLE = 0,
  DETAILED = 1,
}

export const getOrderingForMode = (mode: VIEW_MODE): Array<OrderableComponents> => {
  switch (mode) {
    case VIEW_MODE.DETAILED:
      return [
        'status',
        'snKey',
        'stake',
        'fee',
        'beneficiaryAddress',
        'operatorAddress',
        'version',
        'unlockTimer',
        'updateSmall',
        'rewardTimer',
        'uptimeTimer',
        'contributors',
        'notification',
        'actionButton',
      ];
    default:
      return [
        'status',
        'contributors',
        'notification',
        'expandButton',
        'unlockTimer',
        'updateSmall',
        'rewardTimer',
        'uptimeTimer',
        'version',
        'snKey',
        'operatorAddress',
        'beneficiaryAddress',
        'stake',
        'fee',
        'actionButton',
      ];
  }
};

export type ComponentData = {
  id: OrderableComponents;
  component: ReactNode;
};

export const renderOrderedComponents = (
  isDetailedView: boolean,
  componentData: Array<ComponentData>
) => {
  const ordering = getOrderingForMode(isDetailedView ? VIEW_MODE.DETAILED : VIEW_MODE.SIMPLE);
  return ordering.map((id) => {
    const item = componentData.find((comp) => comp.id === id);
    if (item) {
      return item.component;
    }
    return null;
  });
};

export { StakeCard };
