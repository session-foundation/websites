import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/utils';

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  noPadding?: boolean;
}

const Banner = forwardRef<HTMLDivElement, BannerProps>(({ className, children, ...props }, ref) => {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-around bg-session-green p-2 text-session-black text-sm',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

Banner.displayName = 'Banner';

export { Banner };
