import { type VariantProps, cva } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export const statusVariants = cva('h-3 w-3 rounded-full drop-shadow-lg filter', {
  variants: {
    status: {
      green: 'glow bg-[#00F782] drop-shadow-[0_0_8px_#00F782]',
      blue: 'glow-blue bg-[#00A3F7] drop-shadow-[0_0_8px_#00A3F7]',
      yellow: 'glow-yellow bg-[#F7DE00] drop-shadow-[0_0_8px_#F7DE00]',
      red: 'glow-red bg-red-500 drop-shadow-[0_0_8px_F70000]',
      grey: 'glow-grey bg-[#4A4A4A] drop-shadow-[0_0_8px_#4A4A4A]',
      pending:
        'glow-blue animate-spin rounded-full border-4 border-[#4A4A4A] border-t-[#00A3F7] drop-shadow-[0_0_8px_#00A3F7]',
    },
  },
});

export type StatusIndicatorVariants = VariantProps<typeof statusVariants>;

export const StatusIndicator = ({
  className,
  status,
  ...props
}: HTMLAttributes<HTMLDivElement> & StatusIndicatorVariants) => (
  <div className={cn(statusVariants({ status, className }))} {...props} />
);
