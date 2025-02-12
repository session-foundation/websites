import { forwardRef } from 'react';
import { cn } from '../lib/utils';
import { Button, type ButtonProps } from './ui/button';
import { BinIcon } from '../icons/BinIcon';

const RemoveButton = forwardRef<HTMLButtonElement, ButtonProps & { iconClassName?: string }>(
  ({ className, iconClassName, ...props }, ref) => {
    return (
      <Button
        variant="ghost"
        rounded="md"
        size="collapse"
        className={cn('h-6 w-6 select-all p-1', className)}
        ref={ref}
        {...props}
        data-testid={props['data-testid']}
      >
        <BinIcon className={cn('stroke-destructive h-5 w-5', iconClassName)} />
      </Button>
    );
  }
);
RemoveButton.displayName = 'RemoveButton';

export { RemoveButton };
