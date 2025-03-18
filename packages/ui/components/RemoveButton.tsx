import { forwardRef } from 'react';
import { BinIcon } from '../icons/BinIcon';
import { cn } from '../lib/utils';
import { Button, type ButtonProps } from './ui/button';

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
        <BinIcon className={cn('h-5 w-5 stroke-destructive', iconClassName)} />
      </Button>
    );
  }
);
RemoveButton.displayName = 'RemoveButton';

export { RemoveButton };
