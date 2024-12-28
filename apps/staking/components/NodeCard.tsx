import { Loading } from '@session/ui/components/loading';
import { HumanIcon } from '@session/ui/icons/HumanIcon';
import { cn } from '@session/ui/lib/utils';
import { Tooltip } from '@session/ui/ui/tooltip';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes, type ReactNode, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { areHexesEqual } from '@session/util-crypto/string';
import { formatSENTNumber } from '@session/contracts/hooks/SENT';
import { StakeContributor } from '@session/staking-api-js/client';
import { ButtonDataTestId, StakedNodeDataTestId } from '@/testing/data-test-ids';
import { ArrowDownIcon } from '@session/ui/icons/ArrowDownIcon';
import { Button } from '@session/ui/ui/button';
import { SENT_DECIMALS } from '@session/contracts';

export interface Contributor {
  address: string;
  amount: number;
}

export const outerNodeCardVariants = cva(
  'rounded-xl transition-all ease-in-out bg-module-outline bg-blend-lighten shadow-md p-px',
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
  'rounded-xl w-full h-full flex align-middle flex-col py-5 px-6 bg-module',
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

const nodeCardHeaderVariants = cva('w-full flex flex-row', {
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
      className={cn('text-gradient-white text-lg font-medium leading-none md:text-xl', className)}
      {...props}
    />
  )
);
NodeCardTitle.displayName = 'NodeCardTitle';

const NodeCardText = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('text-gradient-white text-sm font-light md:text-base', className)}
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
  contributor?: StakeContributor;
  isUser?: boolean;
}) => {
  const dictionary = useTranslations('general');
  return (
    <Tooltip
      tooltipContent={
        <p>
          {contributor
            ? `${isUser ? dictionary('you') : contributor.address} | ${formatSENTNumber(contributor.amount)}`
            : dictionary('emptySlot')}
        </p>
      }
    >
      <HumanIcon
        className={cn('fill-text-primary h-4 w-4 cursor-pointer', className)}
        full={Boolean(contributor)}
      />
    </Tooltip>
  );
};

/**
 * Returns the total staked amount for a given address.
 * @param contributors - The list of contributors.
 * @param address - The address to check.
 * @returns The total staked amount for the given address.
 */
export const getTotalStakedAmountForAddress = (
  contributors: Contributor[],
  address: string
): number => {
  return contributors.reduce((acc, { amount, address: contributorAddress }) => {
    return areHexesEqual(contributorAddress, address) ? acc + amount : acc;
  }, 0);
};

export const getTotalStakedAmountForAddressFormatted = (
  contributors: StakeContributor[],
  address?: string
): string => {
  return formatSENTNumber(
    address ? getTotalStakedAmountForAddress(contributors, address) : 0,
    SENT_DECIMALS
  );
};

type StakedNodeContributorListProps = HTMLAttributes<HTMLDivElement> & {
  contributors: StakeContributor[];
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
      const otherContributors = contributors.filter(
        ({ address }) => !areHexesEqual(address, userAddress)
      );
      // TODO - add contributor list sorting
      //.sort((a, b) => b.amount - a.amount);

      return userContributor ? [userContributor, ...otherContributors] : otherContributors;
    }, [contributors]);

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
              className={cn('fill-text-primary h-4')}
            />
          ))}
          {showEmptySlots
            ? emptyContributorSlots.map((key) => (
                <ContributorIcon key={key} className="fill-text-primary h-4" />
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
>(({ className, ...props }, ref) => {
  const [expanded, setExpanded] = useState(false);
  const dictionary = useTranslations('nodeCard.staked');
  return (
    <label
      ref={ref}
      role="button"
      onClick={() => setExpanded((prev) => !prev)}
      aria-label={expanded ? dictionary(`ariaCollapse`) : dictionary(`ariaExpand`)}
      data-testid={
        expanded ? StakedNodeDataTestId.Collapse_Button : StakedNodeDataTestId.Expand_Button
      }
      className={cn(
        'ml-auto flex w-max cursor-pointer select-none items-center align-middle peer-checked:[&>svg]:rotate-180',
        className
      )}
      {...props}
    >
      <span className="text-gradient-white hidden font-medium lg:inline-block">
        {expanded ? dictionary('labelCollapse') : dictionary('labelExpand')}
      </span>
      <ArrowDownIcon
        className={cn(
          'fill-session-text stroke-session-text ml-1 h-4 w-4 transform transition-all duration-300 ease-in-out motion-reduce:transition-none'
        )}
      />
    </label>
  );
});

export const RowLabel = ({ children }: { children: ReactNode }) => (
  <span className="font-semibold">{children} </span>
);

const collapsableContentVariants = cva(
  'h-full max-h-0 select-none gap-1 overflow-y-hidden transition-all duration-300 ease-in-out peer-checked:select-auto motion-reduce:transition-none',
  {
    variants: {
      size: {
        xs: 'text-xs md:text-xs peer-checked:max-h-4',
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
    className="bottom-4 right-6 flex w-max items-end min-[500px]:absolute"
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
