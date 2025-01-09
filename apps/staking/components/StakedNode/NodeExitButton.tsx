import { ButtonDataTestId } from '@/testing/data-test-ids';
import { useTranslations } from 'next-intl';
import { Button } from '@session/ui/ui/button';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@session/ui/lib/utils';
import { CollapsableContent } from '@/components/NodeCard';

export const NodeExitButton = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement> & {
    disabled?: boolean;
  }
>(({ disabled, className, ...props }, ref) => {
  const dictionary = useTranslations('nodeCard.staked.exit');
  return (
    <CollapsableContent
      className={cn('bottom-4 end-6 flex items-end min-[500px]:absolute', className)}
      size="buttonSm"
      width="w-max"
      {...props}
      ref={ref}
    >
      <Button
        aria-label={dictionary('buttonAria')}
        data-testid={ButtonDataTestId.Staked_Node_Exit}
        disabled={disabled}
        rounded="md"
        size="sm"
        variant="destructive-outline"
        className="uppercase"
      >
        {dictionary('buttonText')}
      </Button>
    </CollapsableContent>
  );
});
