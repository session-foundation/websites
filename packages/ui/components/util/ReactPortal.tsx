'use client';

import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

export const portalChildClassName = 'pointer-events-auto z-[20000]';

export function ReactPortal({ children }: { children: ReactNode }) {
  return typeof document !== 'undefined' && document.body !== undefined
    ? createPortal(children, document.body)
    : children;
}
