import {
  NodeCard,
  NodeCardText,
  NodeCardTitle,
  RowLabel,
  ToggleCardExpansionButton,
} from '@/components/NodeCard';
import { NodeOperatorIndicator } from '@/components/StakedNodeCard';
import { StakedNodeDataTestId } from '@/testing/data-test-ids';
import { PubKey } from '@session/ui/components/PubKey';
import {
  StatusIndicator,
  type StatusIndicatorVariants,
} from '@session/ui/components/StatusIndicator';
import { cn } from '@session/ui/lib/utils';
import { useTranslations } from 'next-intl';
import { type HTMLAttributes, type ReactNode, forwardRef } from 'react';

type StakeCardProps = HTMLAttributes<HTMLDivElement> & {
  id: string;
  'data-testid': string;
  title: string;
  statusIndicatorColor: StatusIndicatorVariants['status'];
  summary: ReactNode;
  publicKey?: string;
  isOperator?: boolean;
  collapsableFirstChildren?: ReactNode;
  collapsableLastChildren?: ReactNode;
};

const StakeCard = forwardRef<HTMLDivElement, StakeCardProps>(
  (
    {
      className,
      id,
      summary,
      statusIndicatorColor,
      title,
      isOperator,
      publicKey,
      collapsableFirstChildren,
      collapsableLastChildren,
      ...props
    },
    ref
  ) => {
    const generalNodeDictionary = useTranslations('sessionNodes.general');
    const titleFormat = useTranslations('modules.title');

    const toggleId = `toggle-${id}`;

    return (
      <NodeCard
        ref={ref}
        {...props}
        className={cn(
          'relative flex flex-row flex-wrap items-center gap-x-2 gap-y-0.5 overflow-hidden pb-4 align-middle',
          className
        )}
        data-testid={props['data-testid']}
      >
        <input id={toggleId} type="checkbox" className="peer hidden appearance-none" />
        <StatusIndicator
          status={statusIndicatorColor}
          data-testid={StakedNodeDataTestId.Indicator}
        />
        <NodeCardTitle data-testid={StakedNodeDataTestId.Title}>{title}</NodeCardTitle>
        {summary}
        <ToggleCardExpansionButton htmlFor={toggleId} />
        {collapsableFirstChildren}
        {/** NOTE - ensure any changes here still work with the pubkey component */}
        <NodeCardText className="flex w-full flex-row flex-wrap gap-1 peer-checked:mt-1 peer-checked:[&>.separator]:opacity-0 md:peer-checked:[&>.separator]:opacity-100 peer-checked:[&>span>span>button]:opacity-100 peer-checked:[&>span>span>div]:block peer-checked:[&>span>span>span]:hidden">
          {isOperator ? <NodeOperatorIndicator className="me-0.5" /> : null}
          {publicKey ? (
            <span className="inline-flex flex-nowrap gap-1">
              <RowLabel>
                {titleFormat('format', { title: generalNodeDictionary('publicKeyShort') })}
              </RowLabel>
              <PubKey pubKey={publicKey} alwaysShowCopyButton leadingChars={8} trailingChars={4} />
            </span>
          ) : null}
        </NodeCardText>
        {collapsableLastChildren}
      </NodeCard>
    );
  }
);
StakeCard.displayName = 'StakeCard';

export { StakeCard };
