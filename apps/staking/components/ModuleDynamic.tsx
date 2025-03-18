'use client';

import { ModuleText, type ModuleTextProps } from '@session/ui/components/Module';
import { LoadingText } from '@session/ui/components/loading-text';
import { forwardRef, type ReactNode, useId } from 'react';
import { toastErrorRefetch, type ToastErrorRefetchProps } from './Toast';
import { QUERY_STATUS } from '@/lib/query';
import type { GenericContractStatus } from '@session/contracts/hooks/useContractWriteQuery';
import { RetryIcon } from '@session/ui/icons/RetryIcon';

type GenericQueryProps = {
  fallback: ReactNode;
  errorFallback: ReactNode;
  errorToast: ToastErrorRefetchProps;
};

type ModuleContractReadTextProps = ModuleTextProps & {
  status: GenericContractStatus;
  enabled?: boolean;
} & GenericQueryProps;

const ModuleDynamicContractReadText = forwardRef<HTMLSpanElement, ModuleContractReadTextProps>(
  (
    { className, children, status, fallback, errorFallback, errorToast, enabled, ...props },
    ref
  ) => {
    const toastId = useId();

    if (status === 'error') {
      toastErrorRefetch({
        ...errorToast,
        toastId,
      });
    }
    return (
      <ModuleText ref={ref} className={className} {...props}>
        {status === 'success' ? (
          children ?? fallback
        ) : status === 'error' ? (
          <div
            className="hover:text-session-green group flex cursor-pointer items-center gap-1"
            onClick={errorToast.refetch}
          >
            <RetryIcon className="stroke-session-text group-hover:stroke-session-green h-8 w-8" />
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
ModuleDynamicContractReadText.displayName = 'ModuleDynamicContractReadText';

type ModuleQueryTextProps = ModuleTextProps & {
  status: QUERY_STATUS;
  enabled?: boolean;
} & GenericQueryProps;

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
          children ?? fallback
        ) : status === QUERY_STATUS.ERROR ? (
          <div
            className="hover:text-session-green group flex cursor-pointer items-center gap-1"
            onClick={errorToast.refetch}
          >
            <RetryIcon className="stroke-session-text group-hover:stroke-session-green h-8 w-8" />
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

export { ModuleDynamicContractReadText, ModuleDynamicQueryText };
