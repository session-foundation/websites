import { CopyToClipboardButton, type CopyToClipboardButtonProps } from './CopyToClipboardButton';
import { type InputProps, InputWithEndAdornment } from './ui/input';
import { forwardRef } from 'react';
import { cn } from '../lib/utils';
import * as React from 'react';

export type CopyableInputDisplayProps = InputProps & {
  copyToClipboardProps: CopyToClipboardButtonProps;
};

const CopyableInputDisplay = forwardRef<HTMLInputElement, CopyableInputDisplayProps>(
  ({ className, copyToClipboardProps, ...props }, ref) => {
    return (
      <InputWithEndAdornment
        {...props}
        ref={ref}
        className={cn(className, 'pe-11')}
        endAdornment={
          <div className="flex items-center pe-4">
            <CopyToClipboardButton {...copyToClipboardProps} />
          </div>
        }
      />
    );
  }
);

CopyableInputDisplay.displayName = 'CopyableInputDisplay';

export { CopyableInputDisplay };
