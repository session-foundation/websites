import { skipToken, useQuery } from '@tanstack/react-query';
import { usePublicWeb3Client } from './usePublicWeb3Client';

export function useGasPrice() {
  const publicClient = usePublicWeb3Client();

  const chainId = publicClient?.chain?.id;

  const { data, ...rest } = useQuery({
    queryKey: ['gasPrice', chainId],
    queryFn: publicClient && chainId !== undefined ? () => publicClient.getGasPrice() : skipToken,
  });

  return {
    gasPrice: data ?? null,
    ...rest,
  };
}
