'use client';
import { usePathname, useRouter } from 'next/navigation';
import { type ComponentPropsWithoutRef, type ReactNode, forwardRef, useEffect, useMemo, useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger, type AlertDialogVariantProps,
} from './alert-dialog';
import type { DialogContent } from './dialog';

type ModalProps = ComponentPropsWithoutRef<typeof DialogContent> & AlertDialogVariantProps & {
  children: ReactNode;
  dialogTitle?: ReactNode;
  dialogDescription?: ReactNode;
  navigation?: boolean;
  trigger?: ReactNode;
  triggerClassName?: string;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      size,
      dialogTitle,
      dialogDescription,
      navigation,
      className,
      triggerClassName,
      children,
      trigger,
      ...props
    },
    ref
  ) => {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(!!navigation);
    // biome-ignore lint/correctness/useExhaustiveDependencies: We want only the pathname when the modal open state changes
    const openPathname = useMemo(() => pathname, [open]);

    const onOpenChange = (changeOpen: boolean) => {
      if (!changeOpen) {
        router.back();
      }
    };

    useEffect(() => {
      if (open && pathname !== openPathname) {
        setOpen(false);
      }
    }, [openPathname, open, pathname]);

    return (
      <AlertDialog
        onOpenChange={navigation ? onOpenChange : setOpen}
        open={open}
        defaultOpen={!!navigation}
      >
        {trigger ? <AlertDialogTrigger className={triggerClassName}>{trigger}</AlertDialogTrigger> : null}
        <AlertDialogContent
          size={size}
          className={className}
          dialogTitle={dialogTitle}
          dialogDescription={dialogDescription}
          showBackButton
          ref={ref}
          {...props}
        >
          {children}
        </AlertDialogContent>
      </AlertDialog>
    );
  }
);

Modal.displayName = 'Modal';

export default Modal;
