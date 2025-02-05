'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { useTranslations } from 'next-intl';
import { NodeCard, NodeCardText, NodeCardTitle } from '@/components/NodeCard';
import { cn } from '@session/ui/lib/utils';
import {
  StatusIndicator,
  type StatusIndicatorVariants,
} from '@session/ui/components/StatusIndicator';
import { PubKey } from '@session/ui/components/PubKey';
import Link from 'next/link';
import { Button, ButtonSkeleton } from '@session/ui/ui/button';
import { Skeleton } from '@session/ui/ui/skeleton';
import { TextSeparator } from '@session/ui/components/Separator';

export type InfoNodeCardProps = HTMLAttributes<HTMLDivElement> & {
  pubKey: string;
  buttonSiblings?: ReactNode;
  isActive?: boolean;
  forceSmall?: boolean;
  button?: {
    text: string;
    link: string;
    dataTestId: ButtonDataTestId;
    ariaLabel: string;
  };
  warnings?: ReactNode;
  statusIndicatorColour?: StatusIndicatorVariants['status'];
};

export const InfoNodeCard = forwardRef<HTMLDivElement, InfoNodeCardProps>(
  (
    {
      statusIndicatorColour,
      buttonSiblings,
      isActive,
      className,
      forceSmall,
      pubKey,
      button,
      warnings,
      children,
      ...props
    },
    ref
  ) => {
    const generalNodeDictionary = useTranslations('sessionNodes.general');
    const titleFormat = useTranslations('modules.title');
    return (
      <NodeCard
        ref={ref}
        {...props}
        className={cn(
          'reduced-motion:transition-none flex flex-col items-center justify-between gap-2 border border-transparent align-middle transition-all duration-500 ease-in-out',
          forceSmall ? '' : 'sm:flex-row md:gap-10',
          isActive && 'border-session-green',
          className
        )}
      >
        <div className="flex flex-row gap-6">
          {warnings ? (
            <div className="flex w-max flex-row items-center gap-2 align-middle">{warnings}</div>
          ) : null}
          <div className={cn('text-center sm:text-start', className)}>
            <div className="flex w-full cursor-pointer items-baseline gap-3 text-center align-middle sm:text-start">
              {statusIndicatorColour ? (
                <div className="-me-2 mb-0.5 scale-75 p-0 sm:mr-0 md:scale-100">
                  <StatusIndicator status={statusIndicatorColour} />
                </div>
              ) : null}
              <NodeCardTitle
                className={cn(
                  'inline-flex flex-wrap gap-2',
                  forceSmall ? 'text-xs md:text-base' : 'text-sm md:text-lg'
                )}
              >
                <span className="text-nowrap font-normal">
                  {titleFormat('format', { title: generalNodeDictionary('publicKeyShort') })}
                </span>
                <PubKey pubKey={pubKey} force="collapse" leadingChars={8} trailingChars={4} />
              </NodeCardTitle>
            </div>
            <NodeCardText
              className={cn(
                'col-span-10 mt-1 inline-flex max-h-max flex-row-reverse justify-center gap-2 text-center align-middle font-normal sm:justify-start sm:text-start md:mt-0 md:flex-row',
                forceSmall ? 'text-xs md:text-xs' : 'text-xs md:text-base'
              )}
            >
              {children}
            </NodeCardText>
          </div>
        </div>
        <div className="flex flex-row items-center gap-2 align-middle">
          {buttonSiblings}
          {button ? (
            <Link href={button.link} className="w-full sm:w-auto" prefetch>
              <Button
                variant={isActive ? 'default' : 'outline'}
                size={forceSmall ? 'sm' : 'md'}
                rounded="md"
                aria-label={button.ariaLabel}
                data-testid={button.dataTestId}
                className="w-full sm:w-auto"
              >
                {button.text}
              </Button>
            </Link>
          ) : null}
        </div>
      </NodeCard>
    );
  }
);

export function InfoNodeCardSkeleton() {
  return (
    <div className="border-muted flex w-full flex-row items-center justify-between gap-3 rounded-xl border-2 p-6">
      <div className="-bottom-1/2 flex w-full flex-col gap-3">
        <div className="flex w-full items-center gap-3 align-middle">
          <div className="-mr-2 scale-75 p-0 sm:mr-0 md:scale-100 md:p-0.5">
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <div className="inline-flex gap-2">
            <Skeleton className="h-6 w-40 sm:w-60" />
          </div>
        </div>
        <Skeleton className="h-4 w-9/12" />
      </div>
      <ButtonSkeleton variant="outline" rounded="md" className="h-8 w-16" />
    </div>
  );
}

export const NodeItem = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={className}>{children}</span>
);

export const NodeItemSeparator = ({ className }: { className?: string }) => (
  <TextSeparator className={className} />
);

export const NodeItemLabel = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <span className={cn('font-normal', className)}> {children}</span>;

export const NodeItemValue = ({ children }: { children: ReactNode }) => (
  <span className="text-nowrap font-semibold"> {children}</span>
);
