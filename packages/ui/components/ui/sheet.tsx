'use client';

import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';
import { ChevronsDownIcon } from '../../icons/ChevronsDownIcon';
import { ModuleGrid } from '../ModuleGrid';

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-web3wallet-black fixed z-50',
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-session-black p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  }
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  closeSheet?: () => void;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ className, children, closeSheet, ...props }, ref) => (
  <SheetPortal>
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 gap-4 p-2 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
        'md:data-[state=closed]:slide-out-to-right md:data-[state=open]:slide-in-from-right md:sm:max-w-md md:inset-y-0 md:right-0 md:h-full md:w-3/4 md:border-transparent',
        'max-md:data-[state=closed]:slide-out-to-bottom max-md:data-[state=open]:slide-in-from-bottom bottom-0 h-max w-full'
      )}
    >
      <div
        className={cn(
          'w-full cursor-pointer opacity-55 transition-all duration-200 hover:translate-y-6 md:fixed md:h-full md:w-24 md:-translate-x-16 md:pb-4 md:hover:-translate-x-14 md:hover:-translate-y-0'
        )}
        onClick={closeSheet}
      >
        <div className="flex h-full flex-row justify-between rounded-lg bg-[rgba(255,255,255,0.1)] px-4 py-6 transition-all duration-200 hover:bg-[rgba(255,255,255,0.2)] md:flex-col">
          <SheetPrimitive.Close
            className="rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
            onClick={closeSheet}
          >
            <ChevronsDownIcon className="stroke-web3wallet-text h-8 w-8 transform md:-rotate-90" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
          <SheetPrimitive.Close
            className="rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
            onClick={closeSheet}
          >
            <ChevronsDownIcon className="stroke-web3wallet-text h-8 w-8 transform md:-rotate-90" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        </div>
      </div>
      <ModuleGrid variant="section" className={cn('p-4 md:h-full', className)} {...props}>
        {children}
      </ModuleGrid>
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn('text-foreground text-lg font-semibold', className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
