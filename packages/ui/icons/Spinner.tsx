import { Loader } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '../lib/utils';
import type { SVGAttributes } from './types';

export const Spinner = forwardRef<SVGSVGElement, SVGAttributes>(({ className, ...props }, ref) => (
  <Loader className={cn('animate-spin', className)} {...props} ref={ref} />
));
