'use client';

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import type { ReactNode } from 'react';
import * as React from 'react';

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

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
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

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & { dialogTitle: ReactNode }
>(({ dialogTitle, className, children, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 grid w-full max-w-[90svw] translate-x-[-50%] translate-y-[-50%] shadow-lg duration-200 sm:rounded-lg md:max-w-lg'
      )}
      {...props}
    >
      <Module noPadding>
        <ModuleGridHeader keepDesktopHeaderOnMobile className="relative flex items-center">
          {dialogTitle ? (
            <AlertDialogTitle className="my-2 w-full text-center text-lg font-medium leading-none tracking-tight md:block md:text-3xl">
              {dialogTitle}
            </AlertDialogTitle>
          ) : null}
          <AlertDialogPrimitive.Cancel className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute right-8 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-session-green focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </AlertDialogPrimitive.Cancel>
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
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
    {...props}
  />
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
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
