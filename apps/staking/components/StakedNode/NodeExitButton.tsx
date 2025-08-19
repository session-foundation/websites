import {
  type ImplementedNodeCardActionButtonProps,
  NodeCardActionButton,
} from '@/components/StakedNode/NodeCardActionButton';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { useTranslations } from 'next-intl';
import { forwardRef } from 'react';

export const NodeExitButton = forwardRef<HTMLSpanElement, ImplementedNodeCardActionButtonProps>(
  (props, ref) => {
    const dictionary = useTranslations('nodeCard.staked.exit');

    return (
      <NodeCardActionButton
        {...props}
        ref={ref}
        variant="destructive-outline"
        aria-label={dictionary('buttonAria')}
        data-testid={ButtonDataTestId.Staked_Node_Exit}
      >
        {dictionary('buttonText')}
      </NodeCardActionButton>
    );
  }
);
