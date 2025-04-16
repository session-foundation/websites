import { forwardRef } from 'react';
import { cn } from '../lib/utils';
import type { SVGAttributes } from './types';

export const HamburgerIcon = forwardRef<SVGSVGElement, SVGAttributes>(
  ({ className, ...props }, ref) => (
    <svg
      viewBox="0 0 58 57"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('stroke-2 stroke-current', className)}
      {...props}
      ref={ref}
    >
      <path d="M18 20H40" strokeWidth="inherit" />
      <path d="M18 28.5H40" strokeWidth="inherit" />
      <path d="M18 36.5H40" strokeWidth="inherit" />
    </svg>
  )
);
