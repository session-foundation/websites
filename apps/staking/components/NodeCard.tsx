import { type ButtonDataTestId, StakedNodeDataTestId } from '@/testing/data-test-ids';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import {
  type ContributionContractContributor,
  type StakeContributor,
  isContributionContractContributor,
} from '@session/staking-api-js/schema';
import { Loading } from '@session/ui/components/loading';
import { ArrowDownIcon } from '@session/ui/icons/ArrowDownIcon';
import { HumanIcon } from '@session/ui/icons/HumanIcon';
import { cn } from '@session/ui/lib/utils';
import { Button } from '@session/ui/ui/button';
import { Tooltip } from '@session/ui/ui/tooltip';
import { bigIntSortDesc } from '@session/util-crypto/maths';
import { areHexesEqual } from '@session/util-crypto/string';
import { useWallet } from '@session/wallet/hooks/useWallet';
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
  'flex h-full w-full flex-col rounded-xl bg-module px-6 py-5 align-middle',
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
      <div className={cn(outerNodeCardVariants({ variant }))}>
        <div className={cn(innerNodeCardVariants({ variant, className }))} ref={ref} {...props}>
          {loading ? <Loading /> : children}
        </div>
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

const ContributorIcon = ({
  className,
  contributor,
  isUser,
}: {
  className?: string;
  contributor?: StakeContributor | ContributionContractContributor;
  isUser?: boolean;
}) => {
  const dictionary = useTranslations('general');
  return (
    <Tooltip
      tooltipContent={
        contributor ? (
          <div className="flex flex-col gap-1">
            <span>{isUser ? dictionary('you') : contributor.address}</span>
            <span>
              {`${formatSENTBigInt(contributor.amount)} ${dictionary('staked')}`}
              {isContributionContractContributor(contributor) && contributor.reserved
                ? ` (${formatSENTBigInt(contributor.reserved)} ${dictionary('reserved')})`
                : ''}
            </span>
          </div>
        ) : (
          dictionary('emptySlot')
        )
      }
    >
      <HumanIcon
        className={cn('h-4 w-4 cursor-pointer fill-text-primary', className)}
        full={Boolean(contributor)}
      />
    </Tooltip>
  );
};

type StakedNodeContributorListProps = HTMLAttributes<HTMLDivElement> & {
  contributors: Array<StakeContributor | ContributionContractContributor>;
  showEmptySlots?: boolean;
  forceExpand?: boolean;
};

const NodeContributorList = forwardRef<HTMLDivElement, StakedNodeContributorListProps>(
  ({ className, contributors = [], showEmptySlots, forceExpand, ...props }, ref) => {
    const { address: userAddress } = useWallet();

    const dictionary = useTranslations('maths');

    const [mainContributor, ...otherContributors] = useMemo(() => {
      const userContributor = contributors.find(({ address }) =>
        areHexesEqual(address, userAddress)
      );
      const otherContributors = contributors
        .filter(({ address }) => !areHexesEqual(address, userAddress))
        .sort((a, b) => {
          const aAmount = isContributionContractContributor(a) ? a.amount || a.reserved : a.amount;
          const bAmount = isContributionContractContributor(b) ? b.amount || b.reserved : b.amount;
          return bigIntSortDesc(bAmount, aAmount);
        });

      return userContributor ? [userContributor, ...otherContributors] : otherContributors;
    }, [contributors, userAddress]);

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
        <ContributorIcon
          className="-mr-1"
          contributor={mainContributor}
          isUser={areHexesEqual(mainContributor?.address, userAddress)}
        />
        <div
          className={cn(
            'flex w-min flex-row items-center overflow-x-hidden align-middle',
            forceExpand
              ? 'md:gap-1 md:[&>span]:w-0 md:[&>span]:opacity-0 md:[&>svg]:w-4'
              : 'md:peer-checked:gap-1 [&>span]:w-max [&>span]:opacity-100 md:peer-checked:[&>span]:w-0 md:peer-checked:[&>span]:opacity-0 [&>svg]:w-0 [&>svg]:transition-all [&>svg]:duration-300 [&>svg]:motion-reduce:transition-none md:peer-checked:[&>svg]:w-4',
            className
          )}
          ref={ref}
          {...props}
        >
          {otherContributors.map((contributor) => (
            <ContributorIcon
              key={contributor.address}
              contributor={contributor}
              className={cn(
                'h-4',
                contributor.amount
                  ? 'fill-text-primary'
                  : isContributionContractContributor(contributor) && contributor.reserved
                    ? 'fill-warning'
                    : ''
              )}
            />
          ))}
          {showEmptySlots
            ? emptyContributorSlots.map((key) => (
                <ContributorIcon key={key} className="h-4 fill-text-primary" />
              ))
            : null}
          <span
            className={cn(
              'letter mt-0.5 block text-lg tracking-widest transition-all duration-300 ease-in-out'
            )}
          >
            {showEmptySlots
              ? dictionary('outOf', { count: contributors.length, max: 10 })
              : contributors.length}
          </span>
        </div>
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
          'ms-1 h-4 w-4 transform fill-session-text stroke-session-text transition-all duration-300 ease-in-out motion-reduce:transition-none'
        )}
      />
    </label>
  );
});

export const RowLabel = ({ children }: { children: ReactNode }) => (
  <span className="font-semibold">{children} </span>
);

const collapsableContentVariants = cva(
  'inline-flex h-full max-h-0 select-none flex-wrap gap-1 overflow-y-hidden transition-all duration-300 ease-in-out peer-checked:select-auto motion-reduce:transition-none',
  {
    variants: {
      size: {
        xs: 'text-xs peer-checked:max-h-4 md:text-xs',
        base: cn('text-sm peer-checked:max-h-5', 'md:text-base md:peer-checked:max-h-6'),
        buttonMd: cn('peer-checked:max-h-11'),
        buttonSm: cn('peer-checked:max-h-9'),
      },
      width: {
        'w-full': 'w-full',
        'w-max': 'w-max',
      },
    },
    defaultVariants: {
      size: 'base',
      width: 'w-full',
    },
  }
);

type CollapsableContentProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof collapsableContentVariants>;

export const CollapsableContent = forwardRef<HTMLSpanElement, CollapsableContentProps>(
  ({ className, size, width, ...props }, ref) => (
    <NodeCardText
      ref={ref}
      className={cn(collapsableContentVariants({ size, width, className }))}
      {...props}
    />
  )
);

export const CollapsableButton = forwardRef<
  HTMLButtonElement,
  HTMLAttributes<HTMLButtonElement> & {
    ariaLabel: string;
    dataTestId: ButtonDataTestId;
    disabled?: boolean;
    mobileChildren?: ReactNode;
  }
>(({ ariaLabel, dataTestId, disabled, children, ...props }, ref) => (
  <CollapsableContent
    className="end-6 bottom-4 flex w-max items-end min-[500px]:absolute"
    size="buttonSm"
  >
    <Button
      data-testid={dataTestId}
      aria-label={ariaLabel}
      disabled={disabled}
      rounded="md"
      size="sm"
      variant="destructive-outline"
      className="uppercase"
      ref={ref}
      {...props}
    >
      {children}
    </Button>
  </CollapsableContent>
));

export {
  ContributorIcon,
  NodeCard,
  NodeCardHeader,
  NodeCardText,
  NodeCardTitle,
  NodeContributorList,
  innerNodeCardVariants,
};
