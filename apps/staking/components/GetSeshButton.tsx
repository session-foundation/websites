import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { URL } from '@/lib/constants';
import { Button } from '@session/ui/ui/button';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { cn } from '@session/ui/lib/utils';
import { SessionTokenIcon } from '@session/ui/icons/SessionTokenIcon';

export const GetSeshButton = ({ className }: { className?: string }) => {
  const dictionary = useTranslations('navigation');

  return (
    <Link href={URL.TOKEN_UNISWAP_POOL_ARB} target="_blank" prefetch className={className}>
      <Button
        data-testid={ButtonDataTestId.Token_Uniswap_Pool_Arb}
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
