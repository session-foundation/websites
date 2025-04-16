import { PencilIcon } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '../lib/utils';
import { Button, type ButtonProps } from './ui/button';

const EditButton = forwardRef<HTMLButtonElement, ButtonProps & { iconClassName?: string }>(
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
        <PencilIcon className={cn('h-5 w-5 stroke-session-white', iconClassName)} />
      </Button>
    );
  }
);
EditButton.displayName = 'EditButton';

export { EditButton };
