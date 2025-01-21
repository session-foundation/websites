import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Button } from '@session/ui/ui/button';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { TriangleAlertIcon } from '@session/ui/icons/TriangleAlertIcon';
import { cn } from '@session/ui/lib/utils';
import { SOCIALS } from '@/lib/constants';
import { Social } from '@session/ui/components/SocialLinkList';

export default async function Maintenance() {
  const dict = await getTranslations('maintenance');
  return (
    <div className="-mt-header-displacement flex h-screen w-full items-center justify-center p-32 align-middle">
      <div className="flex flex-col items-center justify-center text-center align-middle md:flex-row md:gap-10 md:text-left">
        <TriangleAlertIcon className={cn('stroke-warning h-60 w-60 stroke-2')} />
        <div className="flex h-full flex-col justify-between gap-3 md:gap-4">
          <p className="text-md text-warning max-w-sm md:text-xl">{dict('title')}</p>
          <p className="text-md max-w-sm md:text-xl">{dict('description')}</p>
          <div className="flex flex-col justify-center gap-4 md:flex-row md:justify-start">
            <Link href={SOCIALS[Social.Discord].link} prefetch={false}>
              <Button
                size="sm"
                variant="outline"
                data-testid={ButtonDataTestId.Maintenance_Discord}
              >
                Discord
              </Button>
            </Link>
            <Link href={SOCIALS[Social.X].link} prefetch={false}>
              <Button
                size="sm"
                variant="outline"
                data-testid={ButtonDataTestId.Maintenance_Discord}
              >
                X (Twitter)
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
