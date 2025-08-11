import { Button, type ButtonProps } from '@session/ui/ui/button';
import { type MouseEvent, type ReactNode, forwardRef, useCallback } from 'react';
import { useWallet } from '../hooks/useWallet';

export type WalletInteractionButtonProps = ButtonProps & {
  targetChainId?: number;
  disconnectedChildren?: ReactNode;
  incorrectChainChildren?: ReactNode;
};

const WalletInteractionButton = forwardRef<HTMLButtonElement, WalletInteractionButtonProps>(
  (
    {
      onClick,
      targetChainId,
      children,
      disconnectedChildren,
      incorrectChainChildren,
      type,
      ...props
    },
    ref
  ) => {
    const { switchChain, chains, setUserSheetOpen, chainId, isConnected } = useWallet();
    const isSupportedChain = chainId === targetChainId;

    const handleClick = useCallback(
      (e: MouseEvent<HTMLButtonElement>) => {
        if (!isConnected) {
          return setUserSheetOpen(true);
        }

        if (!isSupportedChain) {
          const chainId = (
            typeof targetChainId === 'undefined'
              ? chains[0]
              : chains.find((c) => c.id === targetChainId)
          )?.id;

          if (typeof chainId === 'undefined') {
            throw new Error('No chainId available for switching!');
          }

          return switchChain({ chainId });
        }

        if (!onClick || !(typeof onClick === 'function')) {
          return;
        }

        return onClick(e);
      },

      [isSupportedChain, switchChain, onClick, setUserSheetOpen, targetChainId, isConnected, chains]
    );

    // We don't want form interaction when not in the "happy" state
    const _type = isConnected && isSupportedChain ? type : 'button';

    return (
      <Button {...props} ref={ref} onClick={handleClick} type={_type}>
        {!isConnected ? disconnectedChildren : isSupportedChain ? children : incorrectChainChildren}
      </Button>
    );
  }
);

WalletInteractionButton.displayName = 'WalletInteractionButton';

export { WalletInteractionButton };
