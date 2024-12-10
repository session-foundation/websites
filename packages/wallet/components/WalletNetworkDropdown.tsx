import { Button, type ButtonVariantProps } from '@session/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@session/ui/ui/dropdown-menu';
import { useEffect } from 'react';
import { ButtonDataTestId } from '../testing/data-test-ids';
import { useWallet } from '../hooks/useWallet';
import { ConnectedNetworkAvatar, NetworkAvatar } from '@web3sheet/wallet';
import { arbitrum, arbitrumSepolia } from 'viem/chains';

export type WalletNetworkButtonProps = ButtonVariantProps & {
  className?: string;
  handleError: (error: Error) => void;
  labels: {
    mainnet: string;
    testnet: string;
    invalid: string;
  };
  ariaLabels: {
    mainnet: string;
    testnet: string;
    dropdown: string;
  };
};

export default function WalletNetworkDropdown({
  labels,
  ariaLabels,
  handleError,
  ...props
}: WalletNetworkButtonProps) {
  const { chain, switchChain, switchChainError } = useWallet();

  const handleValueChange = async (selectedChain: string) => {
    const chainId = parseInt(selectedChain);
    if (chainId === chain?.id) {
      return;
    }

    switchChain({ chainId });
  };

  useEffect(() => {
    if (switchChainError) {
      handleError(switchChainError);
    }
  }, [switchChainError]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="md"
          data-testid={ButtonDataTestId.Change_Network_Dropdown}
          aria-label={ariaLabels.dropdown}
          {...props}
        >
          <span className="flex flex-row items-center gap-1.5">
            {chain === null ? null : <ConnectedNetworkAvatar size="md" />}
            {chain?.id === arbitrum.id
              ? labels.mainnet
              : chain?.id === arbitrumSepolia.id
                ? labels.testnet
                : labels.invalid}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-max">
        <DropdownMenuLabel>Choose a Network</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={chain?.id?.toString()} onValueChange={handleValueChange}>
          <DropdownMenuRadioItem
            value={arbitrum.id.toString()}
            aria-label={ariaLabels.mainnet}
            className="flex flex-row items-center gap-1.5"
          >
            <NetworkAvatar size="md" id={arbitrum.id} /> {labels.mainnet}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value={arbitrumSepolia.id.toString()}
            aria-label={ariaLabels.testnet}
            className="flex flex-row items-center gap-1.5"
          >
            <NetworkAvatar size="md" id={arbitrumSepolia.id} testnet /> {labels.testnet}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
