'use client';

import { QUERY_STATUS } from '@/lib/query';
import { ModuleText, type ModuleTextProps } from '@session/ui/components/Module';
import { LoadingText } from '@session/ui/components/loading-text';
import { RetryIcon } from '@session/ui/icons/RetryIcon';
import { type ReactNode, forwardRef, useId } from 'react';
import { type ToastErrorRefetchProps, toastErrorRefetch } from './Toast';

type ModuleQueryTextProps = ModuleTextProps & {
  status: QUERY_STATUS;
  enabled?: boolean;
  fallback: ReactNode;
  errorFallback: ReactNode;
  errorToast: ToastErrorRefetchProps;
};

const ModuleDynamicQueryText = forwardRef<HTMLSpanElement, ModuleQueryTextProps>(
  (
    { className, children, status, fallback, errorFallback, errorToast, enabled, ...props },
    ref
  ) => {
    const toastId = useId();
    if (status === QUERY_STATUS.ERROR) {
      toastErrorRefetch({
        ...errorToast,
        toastId,
      });
    }
    return (
      <ModuleText ref={ref} className={className} {...props}>
        {status === QUERY_STATUS.SUCCESS ? (
          (children ?? fallback)
        ) : status === QUERY_STATUS.ERROR ? (
          <div
            className="group flex cursor-pointer items-center gap-1 hover:text-session-green"
            onClick={errorToast.refetch}
            onKeyDown={errorToast.refetch}
          >
            <RetryIcon className="h-8 w-8 stroke-session-text group-hover:stroke-session-green" />
            {errorFallback ?? fallback}
          </div>
        ) : !enabled ? (
          fallback
        ) : (
          <LoadingText />
        )}
      </ModuleText>
    );
  }
);
ModuleDynamicQueryText.displayName = 'ModuleDynamicQueryText';

export { ModuleDynamicQueryText };
