import { Button, type ButtonProps } from '@session/ui/ui/button';
import { type MouseEvent, type ReactNode, forwardRef, useCallback } from 'react';
import { useIsSupportedChain } from '../hooks/useIsSupportedChain';
import { useWallet } from '../hooks/useWallet';

export type WalletInteractionButtonProps = ButtonProps & {
  targetChainId?: number;
  disconnectedChildren?: ReactNode;
  incorrectChainChildren?: ReactNode;
};

const WalletInteractionButton = forwardRef<HTMLButtonElement, WalletInteractionButtonProps>(
  (
    { onClick, targetChainId, children, disconnectedChildren, incorrectChainChildren, ...props },
    ref
  ) => {
    const { switchChain, chains, setUserSheetOpen, isConnected } = useWallet();
    const isSupportedChain = useIsSupportedChain();

    const handleClick = useCallback(
      (e: MouseEvent<HTMLButtonElement>) => {
        if (!onClick || !(typeof onClick === 'function')) {
          return;
        }

        if (!isConnected) {
          return setUserSheetOpen(true);
        }

        if (isSupportedChain) {
          return onClick(e);
        }

        const chainId = (
          typeof targetChainId === 'undefined'
            ? chains[0]
            : chains.find((c) => c.id === targetChainId)
        )?.id;

        if (typeof chainId === 'undefined') {
          throw new Error('No chainId available for switching!');
        }

        return switchChain({ chainId });
      },
      [isSupportedChain, switchChain, onClick, setUserSheetOpen, targetChainId, isConnected, chains]
    );

    return (
      <Button {...props} ref={ref} onClick={handleClick}>
        {!isConnected ? disconnectedChildren : isSupportedChain ? children : incorrectChainChildren}
      </Button>
    );
  }
);

WalletInteractionButton.displayName = 'WalletInteractionButton';

export { WalletInteractionButton };
