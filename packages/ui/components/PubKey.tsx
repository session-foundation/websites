'use client';

import { collapseString } from '@session/util-crypto/string';
import { type HTMLAttributes, forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { ButtonDataTestId } from '../data-test-ids';
import { cn } from '../lib/utils';
import { CopyToClipboardButton } from './CopyToClipboardButton';
import { Tooltip } from './ui/tooltip';

type CollapseStringsParams = Parameters<typeof collapseString>;

export type PubKeyProps = HTMLAttributes<HTMLDivElement> & {
  pubKey: string;
  pubKeyDisplayedOverride?: string;
  leadingChars?: CollapseStringsParams[1];
  trailingChars?: CollapseStringsParams[2];
  expandOnHover?: boolean;
  expandOnHoverDesktopOnly?: boolean;
  alwaysShowCopyButton?: boolean;
  force?: 'expand' | 'collapse';
  copyToClipboardAriaLabel?: string;
  copyToClipboardToastMessage?: string;
};

export const PubKey = forwardRef<HTMLDivElement, PubKeyProps>((props, ref) => {
  const {
    className,
    pubKey,
    pubKeyDisplayedOverride,
    leadingChars = 6,
    trailingChars = 6,
    expandOnHover,
    expandOnHoverDesktopOnly,
    alwaysShowCopyButton,
    copyToClipboardAriaLabel,
    copyToClipboardToastMessage,
    force,
    ...rest
  } = props;
  const [isExpanded, setIsExpanded] = useState(force === 'expand');
  const collapsedPubKey = useMemo(
    () => (pubKey ? collapseString(pubKey, leadingChars, trailingChars) : ''),
    [pubKey, leadingChars, trailingChars]
  );

  const collapsedPubKeyOverride = useMemo(
    () => (pubKeyDisplayedOverride ? collapseString(pubKeyDisplayedOverride, leadingChars, trailingChars) : ''),
      [pubKeyDisplayedOverride, leadingChars, trailingChars]
  )

  const handleSelectionChange = useCallback(() => {
    if (force === 'expand' || force === 'collapse') return;
    setIsExpanded(window.getSelection()?.toString() === pubKey);
  }, [pubKey, force]);

  useEffect(() => {
    /**
     * Keeps the full pubkey visible when selected.
     */
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  const tooltipContent = <div className='flex text-wrap break-all align-middle'>
    {pubKey}
    {pubKeyDisplayedOverride ? <CopyToClipboardButton
    className={cn(
      '-mt-0.5 mx-1 p-0.5 opacity-100 duration-0 hover:bg-session-green hover:text-session-black hover:opacity-100 *:hover:fill-session-black'
    )}
    textToCopy={pubKey}
    data-testid={ButtonDataTestId.Copy_Pub_Key_To_Clipboard}
    aria-label={copyToClipboardAriaLabel ?? 'Copy to Clipboard'}
    copyToClipboardToastMessage={copyToClipboardToastMessage ?? 'Copied to clipboard!'}
  /> : null}
    </div>

  return (
    <span ref={ref} className={cn('group flex select-all items-center', className)} {...rest}>
      {!isExpanded ? (
        <Tooltip tooltipContent={tooltipContent} triggerProps={{ disabled: expandOnHover }} >
          <span
            className={cn(
              'select-all break-all',
              force !== 'collapse' && expandOnHover && 'group-hover:hidden',
              force !== 'collapse' && expandOnHover && isExpanded ? 'hidden' : 'block',
              force !== 'collapse' && expandOnHoverDesktopOnly && 'md:group-hover:hidden',
              force !== 'collapse' && expandOnHoverDesktopOnly && isExpanded
                ? 'md:hidden'
                : 'md:block'
            )}
          >
            {collapsedPubKeyOverride || collapsedPubKey}
          </span>
        </Tooltip>
      ) : null}
      <div
        className={cn(
          'select-all break-all',
          force !== 'collapse' && expandOnHover && 'group-hover:block',
          (force !== 'collapse' && expandOnHover && isExpanded) || isExpanded ? 'block' : 'hidden',
          force !== 'collapse' && expandOnHoverDesktopOnly && 'md:group-hover:block',
          (force !== 'collapse' && expandOnHoverDesktopOnly && isExpanded) || isExpanded
            ? 'md:block'
            : 'md:hidden'
        )}
      >
        {pubKeyDisplayedOverride || pubKey}
      </div>
      <CopyToClipboardButton
        className={cn(
          'mx-1 p-0.5 duration-0 group-hover:bg-session-green group-hover:text-session-black group-hover:opacity-100 *:group-hover:fill-session-black',
          alwaysShowCopyButton || isExpanded ? 'opacity-100' : 'opacity-0'
        )}
        textToCopy={pubKeyDisplayedOverride || pubKey}
        data-testid={ButtonDataTestId.Copy_Pub_Key_To_Clipboard}
        aria-label={copyToClipboardAriaLabel ?? 'Copy to Clipboard'}
        copyToClipboardToastMessage={copyToClipboardToastMessage ?? 'Copied to clipboard!'}
      />
    </span>
  );
});
PubKey.displayName = 'PubKey';
