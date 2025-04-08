import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

const inputVariants = cva(
  'ring-offset-background flex h-10 w-full rounded-md border ps-3 pe-3 py-2 text-sm font-normal file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        dark: 'border-session-white bg-session-black focus-visible:ring-session-white',
        light: 'border-session-black bg-background focus-visible:ring-session-black',
      },
    },
    defaultVariants: {
      variant: 'dark',
    },
  }
);

export type InputVariantProps = VariantProps<typeof inputVariants>;

export type InputProps = InputHTMLAttributes<HTMLInputElement> & InputVariantProps;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export type InputWithEndAdornmentProps = InputProps & {
  endAdornment?: ReactNode;
};

const InputWithEndAdornment = forwardRef<HTMLInputElement, InputWithEndAdornmentProps>(
  ({ className, type, variant, endAdornment, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <Input
          type={type}
          className={cn(inputVariants({ variant, className }), 'w-full')}
          ref={ref}
          {...props}
        />
        <div className="absolute right-0 top-0 flex h-full items-center">{endAdornment}</div>
      </div>
    );
  }
);
InputWithEndAdornment.displayName = 'InputWithEndAdornment';

export { Input, InputWithEndAdornment };
