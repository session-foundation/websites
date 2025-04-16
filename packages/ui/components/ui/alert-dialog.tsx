'use client';

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
} from 'react';

import { X } from 'lucide-react';
import { ArrowDownIcon } from '../../icons/ArrowDownIcon';
import { cn } from '../../lib/utils';
import { Module } from '../Module';
import { MODULE_GRID_ALIGNMENT, ModuleGridContent, ModuleGridHeader } from '../ModuleGrid';
import { buttonVariants } from './button';

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogTitle = AlertDialogPrimitive.Title;

const AlertDialogDescription = AlertDialogPrimitive.Description;

const AlertDialogCancel = AlertDialogPrimitive.Cancel;

const AlertDialogOverlay = forwardRef<
  ComponentRef<typeof AlertDialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-session-black opacity-50 data-[state=closed]:animate-out data-[state=open]:animate-in',
      className
    )}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = forwardRef<
  ComponentRef<typeof AlertDialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & {
    dialogTitle: ReactNode;
    dialogDescription?: ReactNode;
    hideCloseButton?: boolean;
    showBackButton?: boolean;
    onCloseClick?: () => void;
    onBackButtonClick?: () => void;
  }
>(
  (
    {
      dialogTitle,
      dialogDescription,
      hideCloseButton,
      showBackButton,
      onCloseClick,
      onBackButtonClick,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn(
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid w-full max-w-[90svw] translate-x-[-50%] translate-y-[-50%] shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:rounded-lg md:max-w-lg'
        )}
        {...props}
      >
        <Module noPadding>
          <ModuleGridHeader
            keepDesktopHeaderOnMobile
            className="relative flex flex-col items-center px-6"
          >
            {showBackButton ? (
              <AlertDialogPrimitive.Cancel
                onClick={onBackButtonClick}
                className='absolute top-7 left-8 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-session-green focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary'
              >
                <ArrowDownIcon className='h-4 w-4 rotate-90 fill-session-text' />
                <span className="sr-only">Back</span>
              </AlertDialogPrimitive.Cancel>
            ) : null}
            {dialogTitle ? (
              <AlertDialogTitle className='my-2 w-full text-center font-medium text-lg leading-none tracking-tight md:block md:text-3xl'>
                {dialogTitle}
              </AlertDialogTitle>
            ) : null}
            {dialogDescription ? (
              <AlertDialogDescription className="text-center text-sm">
                {dialogDescription}
              </AlertDialogDescription>
            ) : null}
            {!hideCloseButton ? (
              <AlertDialogPrimitive.Cancel
                onClick={onCloseClick}
                className='absolute top-6 right-8 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-session-green focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary'
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </AlertDialogPrimitive.Cancel>
            ) : null}
          </ModuleGridHeader>
          <AlertDialogDescription asChild>
            <ModuleGridContent
              className={cn('overflow-y-auto', className)}
              alignment={MODULE_GRID_ALIGNMENT.TOP}
            >
              {children}
            </ModuleGridContent>
          </AlertDialogDescription>
        </Module>
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  )
);
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

const AlertDialogFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
    {...props}
  />
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

const AlertDialogAction = forwardRef<
  ComponentRef<typeof AlertDialogPrimitive.Action>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants(), className)} {...props} />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
