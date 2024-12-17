import { useWallet as useWalletWeb3Wallet } from '@web3sheet/core';

export const useWallet = useWalletWeb3Wallet;

// TODO: re-implement the add token hook
// export function useAddSessionTokenToWallet(tokenIcon: string) {
//   const [isPending, setIsPending] = useState<boolean>(false);
//   const [isSuccess, setIsSuccess] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const { chain: currentChain } = useWalletChain();
//
//   const addToken = async () => {
//     setIsPending(true);
//     setIsSuccess(false);
//     try {
//       if (!currentChain || (currentChain !== CHAIN.MAINNET && currentChain !== CHAIN.TESTNET)) {
//         throw new Error('Invalid chain');
//       }
//
//       const ethereumProvider = getEthereumWindowProvider();
//       if (!ethereumProvider) {
//         throw new Error('No ethereum provider detected in window object');
//       }
//
//       const walletClient = createWalletClient({
//         chain: chains[currentChain],
//         transport: custom(ethereumProvider),
//       });
//
//       const wasAdded = await walletClient.watchAsset({
//         type: 'ERC20',
//         options: {
//           // The address of the token.
//           address: addresses.SENT[currentChain],
//           // A ticker symbol or shorthand, up to 5 characters.
//           symbol: SENT_SYMBOL.replaceAll('$', ''),
//           // The number of decimals in the token.
//           decimals: SENT_DECIMALS,
//           // A string URL of the token logo.
//           image: tokenIcon,
//         },
//       });
//
//       if (!wasAdded) {
//         throw new Error('Failed to add token');
//       }
//
//       setIsSuccess(true);
//     } catch (error) {
//       if (error instanceof Error) {
//         setError(error.message);
//       } else {
//         setError('Failed to add token');
//       }
//     } finally {
//       setIsPending(false);
//     }
//   };
//   return { addToken, error, isPending, isSuccess };
// }
