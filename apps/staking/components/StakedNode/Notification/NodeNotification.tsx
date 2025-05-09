import { cn } from '@session/ui/lib/utils';
import { type HTMLAttributes, forwardRef } from 'react';

export type NodeNotificationProps = HTMLAttributes<HTMLSpanElement> & {
  level?: 'info' | 'warning' | 'error';
};

export const NodeNotification = forwardRef<HTMLSpanElement, NodeNotificationProps>(
  ({ className, children, level, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'flex w-3/4 flex-row gap-2 font-normal text-xs sm:w-max md:text-base',
        level === 'warning'
          ? 'text-warning'
          : level === 'error'
            ? 'text-destructive'
            : 'text-indicator-blue',
        className
      )}
      {...props}
    >
      <span>•</span>
      {children}
    </span>
  )
);
