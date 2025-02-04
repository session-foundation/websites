import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { BaseDataTestId, TestingProps } from '../data-test-ids';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { PencilIcon } from 'lucide-react';

export interface EditButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    TestingProps<BaseDataTestId.Button> {}

const EditButton = forwardRef<HTMLButtonElement, EditButtonProps>(
  ({ className, ...props }, ref) => {
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
        <PencilIcon className="stroke-session-white h-5 w-5" />
      </Button>
    );
  }
);
EditButton.displayName = 'EditButton';

export { EditButton };
