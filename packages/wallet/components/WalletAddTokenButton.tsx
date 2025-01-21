import { type ButtonVariantProps } from '@session/ui/components/ui/button';

export type WalletAddTokenButtonProps = ButtonVariantProps & {
  tokenIcon: string;
  labels: {
    addToken: string;
    changeNetwork: string;
    pending: string;
  };
  ariaLabels: {
    addToken: string;
    changeNetwork: string;
    pending: string;
  };
  errors: {
    fail: string;
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- TODO: reimplement this component
export default function WalletAddTokenButton(props: WalletAddTokenButtonProps) {
  return null;
  //   const { addToken, error, isPending } = useAddSessionTokenToWallet(props.tokenIcon);
  //   const { chain } = useWalletChain();
  //   const { open } = useWeb3Modal();
  //
  //   const onCorrectChain = chain === CHAIN.MAINNET || chain === CHAIN.TESTNET;
  //
  //   const handleClick = () => {
  //     if (!onCorrectChain) {
  //       open({ view: 'Networks' });
  //     } else {
  //       addToken();
  //     }
  //   };
  //
  //   if (error) {
  //     console.error(error);
  //     toast.error(props.errors.fail);
  //   }
  //
  //   return (
  //     <AddTokenButton
  //       {...props}
  //       handleClick={handleClick}
  //       onCorrectChain={onCorrectChain}
  //       isPending={isPending}
  //     />
  //   );
  // }
  //
  // type AddTokenButtonProps = WalletAddTokenButtonProps & {
  //   handleClick: () => void;
  //   onCorrectChain: boolean;
  //   isPending: boolean;
  // };
  //
  // export function AddTokenButton({
  //   labels,
  //   ariaLabels,
  //   handleClick,
  //   isPending,
  //   onCorrectChain,
  //   ...props
  // }: AddTokenButtonProps) {
  //   const [label, ariaLabel] = useMemo(() => {
  //     if (isPending) {
  //       return [labels.pending, ariaLabels.pending];
  //     }
  //     return onCorrectChain
  //       ? [labels.addToken, ariaLabels.addToken]
  //       : [labels.changeNetwork, ariaLabels.changeNetwork];
  //   }, [isPending, onCorrectChain, labels, ariaLabels]);
  //
  //   return (
  //     <Button
  //       onClick={handleClick}
  //       disabled={isPending}
  //       data-testid={ButtonDataTestId.Add_Token}
  //       className="gap-1 px-2 py-1 uppercase"
  //       aria-label={ariaLabel}
  //       {...props}
  //     >
  //       {label}
  //     </Button>
  //   );
}
