import { URL } from '@/lib/constants';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { SessionTokenIcon } from '@session/ui/icons/SessionTokenIcon';
import { cn } from '@session/ui/lib/utils';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export const GetSeshButton = ({
  network,
  className,
}: { network: 'arb' | 'eth'; className?: string }) => {
  const dictionary = useTranslations('navigation');

  return (
    <Link
      href={network === 'arb' ? URL.TOKEN_UNISWAP_POOL_ARB : URL.TOKEN_UNISWAP_POOL_ETH}
      target="_blank"
      rel="noreferrer"
      prefetch={false}
      className={className}
    >
      <Button
        data-testid={
          network === 'arb'
            ? ButtonDataTestId.Token_Uniswap_Pool_Arb
            : ButtonDataTestId.Token_Uniswap_Pool_Eth
        }
        variant="outline"
        className={cn(
          'group h-full w-full items-center justify-center gap-1.5 whitespace-nowrap',
          'inline-flex'
        )}
      >
        <SessionTokenIcon
          className={cn(
            'h-4 w-4 filter transition group-hover:brightness-0 group-hover:saturate-0'
          )}
        />
        {dictionary('getToken')}
      </Button>
    </Link>
  );
};
