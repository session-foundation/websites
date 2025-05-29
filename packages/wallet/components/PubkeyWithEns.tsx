'use client';

import { PubKey, type PubKeyProps } from '@session/ui/components/PubKey';
import { forwardRef } from 'react';
import { useEnsName } from '../hooks/useEnsName';

export const PubkeyWithEns = forwardRef<HTMLDivElement, PubKeyProps>(
  ({ pubKey, expandOnHoverDesktopOnly, expandOnHover, ...props }, ref) => {
    const { ensName, hasName } = useEnsName(pubKey);

    return (
      <PubKey
        {...props}
        ref={ref}
        pubKey={pubKey}
        pubKeyDisplayedOverride={ensName}
        expandOnHover={hasName ? false : expandOnHover}
        expandOnHoverDesktopOnly={hasName ? false : expandOnHoverDesktopOnly}
      />
    );
  }
);
