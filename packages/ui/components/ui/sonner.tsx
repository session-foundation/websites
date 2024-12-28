'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToastT, useSonner } from 'sonner';
import { cn } from '../../lib/utils';
import {
  type ComponentProps,
  createContext,
  Fragment,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { XCircleIcon } from 'lucide-react';
import { Button } from './button';
import { ButtonDataTestId } from '../../data-test-ids';

function renderToastNode(node: ToastT['description']) {
  return typeof node === 'function' ? node() : node;
}

type ToasterProps = ComponentProps<typeof Sonner>;

export const Toaster = ({ ...props }: ToasterProps) => {
  const { showHistory, setShowHistory, toastHistory, setToastHistory } = useToasterHistory();
  const { theme = 'system' } = useTheme();
  const { toasts } = useSonner();

  const [toastIds] = useState<Set<string | number>>(new Set());

  // Not a fun of this but it works, the map uses the id as the key so it automatically dedupes toasts.
  // The toast array from useSonner only contains the active toasts, which are removed when a user
  //   dismisses them or after the toast's duration has passed.
  useEffect(() => {
    toasts.forEach((toast) => {
      const toastIdx = toastHistory.findIndex((t) => t.id === toast.id);
      if (toastIdx === -1) {
        setToastHistory((prev) => [...prev, toast]);
        toastIds.add(toast.id);
      } else {
        toastHistory[toastIdx] = toast;
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
              'bg-session-black border-current group-hover:opacity-100 opacity-0 group-[.toast]:bg-session-black group-[.toast]:hover:bg-session-white group-[.toaster]:hover:text-session-black group-[.toaster]:hover:border-transparent',
          },
        }}
        position="bottom-right"
        closeButton={true}
        {...props}
      />
      {/* Note: Has to be z-index higher than Sonner, the sonner is 999999999 */}
      <div className="absolute bottom-10 z-[9999999999] mx-6 flex w-[90vw] flex-col items-end gap-2 md:right-14 md:w-auto">
        {showHistory && toastHistory.length ? (
          <div className="bg-session-black border-session-white max-h-96 overflow-y-auto rounded-md border md:w-[40vh]">
            {toastHistory.map((toast, index) => (
              <Fragment key={toast.id}>
                <div
                  className={cn(
                    'text-session-text flex flex-row gap-1.5 py-4 pe-4 ps-2 text-sm font-normal',
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
                    className="text-destructive h-5 w-5 px-0.5"
                    onClick={() => {
                      setToastHistory((prev) => prev.filter((t) => t.id !== toast.id));
                      toastIds.delete(toast.id);
                      if (!toastIds.size) setShowHistory(false);
                    }}
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </Button>
                  <span className="font-medium">{renderToastNode(toast.title)}</span>
                  <span>{renderToastNode(toast.description)}</span>
                </div>
                <div
                  className={cn(
                    'border-session-text w-full border-b',
                    index === toastHistory.length - 1 && 'hidden'
                  )}
                />
              </Fragment>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
};

type ToasterContext = {
  toastHistory: Array<ToastT>;
  setToastHistory: (toastHistory: Array<ToastT>) => void;
  showHistory: boolean;
  setShowHistory: (showHistory: boolean) => void;
};

const ToasterContext = createContext<ToasterContext | undefined>(undefined);

export default function ToasterProvider({ children }: { children?: ReactNode }) {
  const [toastHistory, setToastHistory] = useState<Array<ToastT>>([]);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <ToasterContext.Provider value={{ toastHistory, setToastHistory, showHistory, setShowHistory }}>
      {children}
    </ToasterContext.Provider>
  );
}

export function useToasterHistory() {
  const context = useContext(ToasterContext);

  if (context === undefined) {
    throw new Error('useToasterHistory must be used inside ToasterProvider');
  }

  return context;
}
