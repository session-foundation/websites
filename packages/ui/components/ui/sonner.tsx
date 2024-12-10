'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToastT, useSonner } from 'sonner';
import { cn } from '../../lib/utils';
import { type ComponentProps, useEffect, useState } from 'react';
import { ListChecks, ListX, XCircleIcon } from 'lucide-react';
import { Button } from './button';
import { ButtonDataTestId } from '../../data-test-ids';

function renderToastNode(node: ToastT['description']) {
  return typeof node === 'function' ? node() : node;
}

type ToasterProps = ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const [showHistory, setShowHistory] = useState(false);
  const { theme = 'system' } = useTheme();
  const { toasts } = useSonner();

  const [toastHistory, setToastHistory] = useState<Array<ToastT>>([]);
  const [toastIds] = useState<Set<string | number>>(new Set());

  // Not a fun of this but it works, the map uses the id as the key so it automatically dedupes toasts.
  // The toast array from useSonner only contains the active toasts, which are removed when a user
  //   dismisses them or after the toast's duration has passed.
  useEffect(() => {
    toasts.forEach((toast) => {
      if (!toastIds.has(toast.id)) {
        toastIds.add(toast.id);
        setToastHistory((prev) => [...prev, toast]);
      }
    });
  }, [toasts]);

  return (
    <>
      <Sonner
        theme={theme as ToasterProps['theme']}
        className={cn(
          'toaster group mb-4 lg:me-8 lg:flex lg:items-center lg:justify-end',
          props.className
        )}
        toastOptions={{
          duration: 10000,
          actionButtonStyle: {
            background: 'transparent',
            color: 'currentColor',
            fontWeight: 700,
            marginRight: '-1.5rem',
            textDecoration: 'underline',
          },
          cancelButtonStyle: {
            background: 'transparent',
            color: 'currentColor',
            fontWeight: 700,
            marginRight: '-1.5rem',
            textDecoration: 'underline',
          },
          classNames: {
            toast:
              'group toast group-[.toaster]:bg-session-black group-[.toaster]:shadow-lg group-[.toaster]:font-roboto-flex group-[.toaster]:text-[15px] group-[.toaster]:px-8 group-[.toaster]:py-5 group-[.toast-action]:bg-session-green',
            description: 'text-muted-foreground',
            icon: 'inline w-6 h-6 *:w-6 *:h-6',
            success:
              'toast-success bg-session-black text-session-green border border-session-green',
            error: 'toast-error bg-session-black text-destructive border border-destructive',
            warning: 'toast-warning bg-session-black text-warning border border-warning',
            closeButton:
              'bg-session-black border-current group-hover:opacity-100 opacity-0 group-[.toast-success]:hover:bg-session-green group-[.toast-error]:bg-session-black group-[.toast-error]:hover:bg-destructive group-[.toast-warning]:hover:bg-warning group-[.toaster]:hover:text-session-black group-[.toaster]:hover:border-transparent',
          },
        }}
        position="bottom-right"
        closeButton={true}
        {...props}
      />
      {/* Note: Has to be z-index higher than Sonner, the sonner is 999999999 */}
      <div className="absolute bottom-2 right-14 z-[9999999999] flex flex-col items-end gap-2">
        {showHistory && toastHistory.length ? (
          <div className="bg-session-black border-session-white max-h-96 w-[40vh] overflow-y-auto rounded-md border">
            {toastHistory.map((toast, index) => (
              <>
                <div
                  key={toast.id}
                  className={cn(
                    'text-session-text relative ms-3 flex flex-col px-5 py-5 text-sm font-normal',
                    toast.type === 'success' && 'text-session-green',
                    toast.type === 'error' && 'text-destructive',
                    toast.type === 'warning' && 'text-warning',
                    toast.type === 'info' && 'text-session-text'
                  )}
                >
                  <Button
                    data-testid={ButtonDataTestId.Delete_Toast_In_History}
                    size="xs"
                    rounded="full"
                    variant="ghost"
                    className="absolute -left-3 top-2"
                    onClick={() => {
                      setToastHistory((prev) => prev.filter((t) => t.id !== toast.id));
                      toastIds.delete(toast.id);
                    }}
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </Button>
                  <span className="font-medium">{renderToastNode(toast.title)}</span>
                  <span>{renderToastNode(toast.description)}</span>
                </div>
                <div
                  key={`${toast.id}-divider`}
                  className={cn(
                    'border-session-text w-full border-b',
                    index === toastHistory.length - 1 && 'hidden'
                  )}
                />
              </>
            ))}
          </div>
        ) : null}
        {toastHistory.length ? (
          <Button
            variant="ghost"
            size="icon"
            rounded="full"
            onClick={() => setShowHistory(!showHistory)}
            data-testid={ButtonDataTestId.Toggle_Show_Toaster_History}
          >
            {showHistory ? <ListX className="h-5 w-5" /> : <ListChecks className="h-5 w-5" />}
          </Button>
        ) : null}
      </div>
    </>
  );
};

export { Toaster };
