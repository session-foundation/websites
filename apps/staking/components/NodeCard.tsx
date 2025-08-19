import { AddressLink } from '@/components/AddressLink';
import { ExitRequestorIndicator, NodeOperatorIndicator } from '@/components/StakedNodeCard';
import { StakedNodeDataTestId } from '@/testing/data-test-ids';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import {
  type ContributionContractContributor,
  type StakeContributor,
  isContributionContractContributor,
} from '@session/staking-api-js/schema';
import { Loading } from '@session/ui/components/loading';
import { ArrowDownIcon } from '@session/ui/icons/ArrowDownIcon';
import { HumanIcon } from '@session/ui/icons/HumanIcon';
import { KeyRoundIcon } from '@session/ui/icons/KeyRoundIcon';
import { cn } from '@session/ui/lib/utils';
import { Tooltip } from '@session/ui/ui/tooltip';
import type { EthereumAddress } from '@session/util-crypto/keys';
import { areEthereumAddressesEqual } from '@session/util-crypto/string';
import { PubkeyWithEns } from '@session/wallet/components/PubkeyWithEns';
import { type VariantProps, cva } from 'class-variance-authority';
import { useTranslations } from 'next-intl';
import { type HTMLAttributes, type ReactNode, forwardRef, useMemo, useState } from 'react';

export const outerNodeCardVariants = cva(
  'rounded-xl bg-module-outline p-px bg-blend-lighten shadow-md transition-all ease-in-out',
  {
    variants: {
      variant: {
        default: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const innerNodeCardVariants = cva(
  'flex h-full w-full flex-col rounded-xl bg-module px-5 py-4 align-middle md:px-6 md:py-5',
  {
    variants: {
      variant: {
        default: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface StakeCardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof innerNodeCardVariants> {
  loading?: boolean;
}

const NodeCard = forwardRef<HTMLDivElement, StakeCardProps>(
  ({ className, variant, loading, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          'relative flex w-full flex-row flex-wrap items-center gap-0.5 rounded-xl bg-module px-5 py-4 align-middle reduced-motion:transition-none transition-all duration-500 ease-in-out md:px-6 md:py-5',
          className
        )}
        style={{
          boxShadow: '0 0 0 1px #608983',
        }}
        ref={ref}
        {...props}
      >
        {loading ? <Loading /> : children}
      </div>
    );
  }
);

NodeCard.displayName = 'NodeCard';

const nodeCardHeaderVariants = cva('flex w-full flex-row', {
  variants: {
    variant: {
      default: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface NodeCardHeaderProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof nodeCardHeaderVariants> {
  loading?: boolean;
}

const NodeCardHeader = forwardRef<HTMLDivElement, NodeCardHeaderProps>(
  ({ className, variant, loading, children, ...props }, ref) => {
    return (
      <div className={cn(nodeCardHeaderVariants({ variant, className }))} ref={ref} {...props}>
        {loading ? <Loading /> : children}
      </div>
    );
  }
);
NodeCardHeader.displayName = 'NodeCardHeader';

const NodeCardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn('font-medium text-gradient-white text-lg leading-none md:text-xl', className)}
      {...props}
    />
  )
);
NodeCardTitle.displayName = 'NodeCardTitle';

const NodeCardText = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('font-light text-gradient-white text-sm md:text-base', className)}
      {...props}
    />
  )
);
NodeCardText.displayName = 'NodeCardText';

type ContributorIconProps = {
  className?: string;
  contributor?: StakeContributor | ContributionContractContributor;
  isUser?: boolean;
  isOperator?: boolean;
  isRequestingExit?: boolean;
};

const humanIconClassName = (
  contributor?: StakeContributor | ContributionContractContributor,
  isUser?: boolean,
  className?: string
) =>
  cn(
    'h-4 w-4',
    contributor
      ? contributor.amount
        ? isUser
          ? 'fill-session-green'
          : 'fill-text-primary'
        : isContributionContractContributor(contributor) && contributor.reserved
          ? 'fill-warning'
          : 'fill-text-primary'
      : 'fill-text-primary',
    className
  );

function ContributorTooltipCard({
  contributor,
  isUser,
  isOperator,
  isRequestingExit,
}: ContributorIconProps & Required<Pick<ContributorIconProps, 'contributor'>>) {
  const dictionary = useTranslations('general');
  const dictionaryStakedNode = useTranslations('nodeCard.staked');
  return (
    <div className="flex flex-row gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex flex-row gap-2">
          <ContributorIcon
            className="mt-0.5"
            contributor={contributor}
            isUser={isUser}
            isOperator={isOperator}
            isRequestingExit={isRequestingExit}
          />
          <PubkeyWithEns pubKey={contributor.address} />
          <AddressLink address={contributor.address} />
        </div>
        <span className="flex flex-row gap-2">
          {isOperator ? <NodeOperatorIndicator /> : null}
          {`${formatSENTBigInt(contributor.amount)} ${dictionary('staked')}`}
        </span>
        {isContributionContractContributor(contributor) && contributor.reserved
          ? `${formatSENTBigInt(contributor.reserved)} ${dictionary('reserved')}`
          : ''}
        {isRequestingExit ? (
          <span className="flex flex-row gap-2">
            <ExitRequestorIndicator isConnectedWallet={isUser} />
            {dictionaryStakedNode('exitRequestor')}
          </span>
        ) : null}
      </div>
    </div>
  );
}

const ContributorIcon = forwardRef<
  HTMLDivElement,
  ContributorIconProps & HTMLAttributes<HTMLDivElement>
>(({ className, contributor, isUser, isOperator, isRequestingExit, ...props }, ref) => (
  <div ref={ref} {...props} className={cn('contrib-icon relative h-max', className)}>
    <HumanIcon
      className={humanIconClassName(contributor, isUser, className)}
      full={!!contributor?.amount}
    />
    {isRequestingExit ? (
      <KeyRoundIcon className="-bottom-0.5 -right-0.5 absolute h-3 w-3 fill-warning stroke-session-black" />
    ) : null}
  </div>
));

const ContributorIconWithTooltip = ({
  className,
  contributor,
  isUser,
  isOperator,
  isRequestingExit,
}: ContributorIconProps) => {
  const dictionary = useTranslations('general');
  return (
    <Tooltip
      tooltipContent={
        contributor ? (
          <ContributorTooltipCard
            contributor={contributor}
            isUser={isUser}
            isOperator={isOperator}
            isRequestingExit={isRequestingExit}
          />
        ) : (
          dictionary('emptySlot')
        )
      }
    >
      <ContributorIcon
        className={className}
        contributor={contributor}
        isUser={isUser}
        isOperator={isOperator}
        isRequestingExit={isRequestingExit}
      />
    </Tooltip>
  );
};

type StakedNodeContributorListProps = HTMLAttributes<HTMLDivElement> & {
  contributors: Array<StakeContributor | ContributionContractContributor>;
  userAddress?: EthereumAddress;
  operatorAddress: EthereumAddress;
  exitRequestAddress?: EthereumAddress;
  showEmptySlots?: boolean;
  forceExpand?: boolean;
};

const NodeContributorList = forwardRef<HTMLDivElement, StakedNodeContributorListProps>(
  (
    {
      className,
      contributors = [],
      operatorAddress,
      exitRequestAddress,
      userAddress,
      showEmptySlots,
      forceExpand,
      ...props
    },
    ref
  ) => {
    const dictionary = useTranslations('maths');

    const userContributor = useMemo(
      () => contributors.find(({ address }) => areEthereumAddressesEqual(address, userAddress)),
      [contributors, userAddress]
    );

    const emptyContributorSlots = useMemo(
      () =>
        showEmptySlots
          ? Array.from(
              {
                length: 10 - contributors.length,
              },
              (_, index) => `empty-slot-${index}`
            )
          : [],
      [showEmptySlots, contributors.length]
    );

    return (
      <>
        {!forceExpand ? (
          <ContributorIconWithTooltip
            className={cn('fill-text-primary peer-checked:hidden peer-checked:opacity-0')}
            contributor={userContributor}
            isOperator={areEthereumAddressesEqual(userContributor?.address, operatorAddress)}
            isRequestingExit={areEthereumAddressesEqual(
              userContributor?.address,
              exitRequestAddress
            )}
            isUser
          />
        ) : null}
        <div
          className={cn(
            'flex w-max flex-row items-center align-middle',
            forceExpand
              ? 'gap-0.5 md:gap-1 [&>.contrib-icon]:w-4'
              : 'peer-checked:gap-0.5 md:peer-checked:gap-1 [&>.contrib-icon>svg]:w-0 peer-checked:[&>.contrib-icon>svg]:w-4 [&>.contrib-icon]:w-0 [&>.contrib-icon]:opacity-0 [&>.contrib-icon]:transition-all [&>.contrib-icon]:duration-300 peer-checked:[&>.contrib-icon]:w-4 peer-checked:[&>.contrib-icon]:opacity-100 [&>.contrib-icon]:motion-reduce:transition-none',
            className
          )}
          ref={ref}
          {...props}
        >
          {contributors.map((contributor) => (
            <ContributorIconWithTooltip
              key={contributor.address}
              contributor={contributor}
              isUser={areEthereumAddressesEqual(contributor.address, userAddress)}
              isOperator={areEthereumAddressesEqual(contributor.address, operatorAddress)}
              isRequestingExit={areEthereumAddressesEqual(contributor.address, exitRequestAddress)}
            />
          ))}
          {showEmptySlots
            ? emptyContributorSlots.map((key) => (
                <ContributorIconWithTooltip key={key} className="h-4" />
              ))
            : null}
        </div>
        <span
          className={cn(
            'letter mt-0.5 block text-lg tracking-widest transition-all duration-300 ease-in-out',
            forceExpand
              ? 'w-0 opacity-0'
              : 'w-max opacity-100 peer-checked:w-0 peer-checked:opacity-0'
          )}
        >
          {showEmptySlots
            ? dictionary('outOf', { count: contributors.length, max: 10 })
            : contributors.length}
        </span>
      </>
    );
  }
);

type ToggleCardExpansionButtonProps = HTMLAttributes<HTMLLabelElement> & {
  htmlFor: string;
};

export const ToggleCardExpansionButton = forwardRef<
  HTMLLabelElement,
  ToggleCardExpansionButtonProps
>(({ htmlFor, className, ...props }, ref) => {
  const [expanded, setExpanded] = useState(false);
  const dictionary = useTranslations('nodeCard.staked');
  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole lint/a11y/useSemanticElements: This is a toggle button
      role="button"
      tabIndex={-1}
      onClick={() => setExpanded((prev) => !prev)}
      aria-label={expanded ? dictionary('ariaCollapse') : dictionary('ariaExpand')}
      data-testid={
        expanded ? StakedNodeDataTestId.Collapse_Button : StakedNodeDataTestId.Expand_Button
      }
      className={cn(
        'ms-auto flex w-max cursor-pointer select-none items-center align-middle peer-checked:[&>svg]:rotate-180',
        className
      )}
      {...props}
    >
      <span className="hidden font-medium text-gradient-white lg:inline-block">
        {expanded ? dictionary('labelCollapse') : dictionary('labelExpand')}
      </span>
      <ArrowDownIcon
        className={cn(
          'ms-2 h-4 w-4 transform fill-session-text stroke-session-text transition-all duration-300 ease-in-out motion-reduce:transition-none'
        )}
      />
    </label>
  );
});

export const RowLabel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn('content-center font-semibold', className)}>{children} </span>
);

const collapsableContentVariants = cva(
  'inline-flex select-none flex-wrap items-center gap-1 transition-all duration-300 ease-in-out peer-checked:select-auto motion-reduce:transition-none',
  {
    variants: {
      size: {
        xs: 'text-xs peer-checked:max-h-4 md:text-xs',
        base: cn('text-sm peer-checked:max-h-5', 'md:text-base md:peer-checked:max-h-6'),
        large: cn('peer-checked:max-h-12 sm:gap-1 sm:peer-checked:max-h-5'),
        buttonMd: cn('peer-checked:max-h-11'),
        buttonSm: cn('peer-checked:max-h-9'),
      },
      width: {
        'w-full': 'w-full',
        'w-max': 'w-max',
      },
      forceExpanded: {
        false: 'h-full max-h-0 overflow-y-hidden',
        true: '',
      },
    },
    defaultVariants: {
      size: 'base',
      width: 'w-full',
      forceExpanded: false,
    },
  }
);

export type CollapsableContentProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof collapsableContentVariants> & {
    forceExpanded?: boolean;
  };

export const CollapsableContent = forwardRef<HTMLSpanElement, CollapsableContentProps>(
  ({ className, size, width, forceExpanded, ...props }, ref) => (
    <NodeCardText
      ref={ref}
      className={cn(collapsableContentVariants({ size, width, forceExpanded, className }))}
      {...props}
    />
  )
);

export {
  ContributorIconWithTooltip,
  NodeCard,
  NodeCardHeader,
  NodeCardText,
  NodeCardTitle,
  NodeContributorList,
  innerNodeCardVariants,
};
