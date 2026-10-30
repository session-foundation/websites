import { forwardRef } from 'react';
import * as React from 'react';
import { cn } from '../lib/utils';
import { CopyToClipboardButton, type CopyToClipboardButtonProps } from './CopyToClipboardButton';
import { type InputProps, InputWithEndAdornment } from './ui/input';

export type CopyableInputDisplayProps = InputProps & {
  copyToClipboardProps: CopyToClipboardButtonProps;
};

const CopyableInputDisplay = forwardRef<HTMLInputElement, CopyableInputDisplayProps>(
  ({ className, copyToClipboardProps, ...props }, ref) => {
    return (
      <InputWithEndAdornment
        {...props}
        ref={ref}
        className={cn(className, 'pe-9')}
        endAdornment={
          <div className="flex items-center pe-2">
            <CopyToClipboardButton {...copyToClipboardProps} />
          </div>
        }
      />
    );
  }
);

CopyableInputDisplay.displayName = 'CopyableInputDisplay';

export { CopyableInputDisplay };
