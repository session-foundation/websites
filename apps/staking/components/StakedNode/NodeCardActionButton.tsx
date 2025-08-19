import { CollapsableContent, type CollapsableContentProps } from '@/components/NodeCard';
import { cn } from '@session/ui/lib/utils';
import { Button, type ButtonProps } from '@session/ui/ui/button';
import Link from 'next/link';
import { forwardRef } from 'react';

type NodeCardActionButtonProps = CollapsableContentProps &
  Pick<ButtonProps, 'disabled' | 'data-testid' | 'variant' | 'aria-label'> & {
    href?: string;
  };

export type ImplementedNodeCardActionButtonProps = CollapsableContentProps &
  Pick<ButtonProps, 'disabled'>;

export const NodeCardActionButton = forwardRef<HTMLSpanElement, NodeCardActionButtonProps>(
  (
    {
      disabled,
      'data-testid': dataTestId,
      variant,
      className,
      children,
      href,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const button = (
      <Button
        aria-label={ariaLabel}
        data-testid={dataTestId}
        disabled={disabled}
        rounded="md"
        size="sm"
        variant={variant}
        className="uppercase"
      >
        {children}
      </Button>
    );

    const comp = href ? <Link href={href}>{button}</Link> : button;

    return (
      <CollapsableContent
        className={cn(
          'end-6 bottom-4 flex items-end min-[500px]:absolute',
          props.forceExpanded ? '[&_button]:h-7 peer-checked:[&_button]:h-9' : '',
          className
        )}
        size="buttonSm"
        width="w-max"
        {...props}
        ref={ref}
      >
        {comp}
      </CollapsableContent>
    );
  }
);
