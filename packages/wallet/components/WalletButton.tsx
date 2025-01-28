import { useMemo } from 'react';
import { cn } from '@session/ui/lib/utils';
import { Button, type ButtonProps } from '@session/ui/ui/button';
import { ButtonDataTestId } from '../testing/data-test-ids';
import { SessionTokenIcon } from '@session/ui/icons/SessionTokenIcon';
import { formatBigIntTokenValue } from '@session/util-crypto/maths';
import { ConnectedWalletAvatar } from '@web3sheet/wallet';
import { useWallet } from '../hooks/useWallet';
import { useWalletButton } from '../providers/wallet-button-provider';
import { useERC20Balance } from '@web3sheet/core';

export type WalletButtonProps = Omit<ButtonProps, 'data-testid'> & {
  disconnectedLabel: string;
  disconnectedAriaLabel: string;
  connectedAriaLabel: string;
  hideBalance?: boolean;
};

export function WalletButton({
  disconnectedLabel,
  disconnectedAriaLabel,
  connectedAriaLabel,
  hideBalance,
  className,
  ...props
}: WalletButtonProps) {
  const { chainId, tokens, isConnected, userSheetOpen, setUserSheetOpen, resolvedIdentifierShort } =
    useWallet();

  const { isBalanceVisible } = useWalletButton();

  const token = useMemo(
    () => tokens?.find((token) => token.network.id === chainId),
    [chainId, tokens]
  );

  const { data: tokenData } = useERC20Balance({
    chainId,
    tokenAddress: token && 'tokenAddress' in token ? token.tokenAddress : undefined,
  });

  const tokenBalance = useMemo(
    () =>
      tokenData
        ? `${tokenData.value ? formatBigIntTokenValue(tokenData.value, tokenData.decimals ?? 0) : 0} ${tokenData.symbol ?? ''}`
        : '0',
    [tokenData]
  );

  const handleClick = () => {
    if (userSheetOpen) return;
    setUserSheetOpen(true);
  };

  return (
    <Button
      onClick={handleClick}
      className={cn(
        'group',
        'select-none justify-end overflow-x-hidden text-xs',
        isConnected
          ? 'bg-session-green hover:bg-session-green hover:text-session-black h-full w-full max-w-28 border-2 px-0 py-0 transition-all duration-1000 ease-in-out hover:brightness-110 motion-reduce:transition-none sm:max-w-36 lg:hover:max-w-full lg:focus:max-w-full lg:active:max-w-full'
          : 'px-3 py-2',
        isBalanceVisible && 'lg:max-w-full',
        className
      )}
      aria-label={isConnected ? connectedAriaLabel : disconnectedAriaLabel}
      data-testid={ButtonDataTestId.Wallet_Modal}
      {...props}
    >
      {isConnected ? (
        <>
          {!hideBalance ? (
            <div
              className={cn(
                'text-session-white -mr-4 inline-flex h-full w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-s-md py-2.5 pe-6 ps-3 text-xs md:text-sm',
                'group-hover:bg-session-black group-active:bg-session-black group-focus:bg-session-black transition-colors delay-1000 duration-0 ease-in-out group-hover:delay-0 group-focus:delay-0 group-active:delay-0 motion-reduce:transition-none',
                isBalanceVisible && 'bg-session-black delay-0'
              )}
            >
              <SessionTokenIcon className="h-4 w-4" />
              {tokenBalance}
            </div>
          ) : null}
          <div
            className={cn(
              'inline-flex h-full items-center justify-evenly gap-1 whitespace-nowrap px-2 py-2 text-xs md:text-sm',
              !hideBalance && 'bg-session-green w-full sm:w-36 sm:min-w-36'
            )}
          >
            <ConnectedWalletAvatar size="md" />
            {resolvedIdentifierShort}
          </div>
        </>
      ) : (
        disconnectedLabel
      )}
    </Button>
  );
}
