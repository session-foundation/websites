import { SOCIALS } from '@/lib/constants';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Social } from '@session/ui/components/SocialLinkList';
import { TriangleAlertIcon } from '@session/ui/icons/TriangleAlertIcon';
import { cn } from '@session/ui/lib/utils';
import { Button } from '@session/ui/ui/button';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function Maintenance() {
  const dict = await getTranslations('maintenance');
  return (
    <div className="-mt-header-displacement flex h-screen w-full items-center justify-center p-32 align-middle">
      <div className="mt-10 flex flex-col items-center justify-center text-center align-middle md:mt-0 md:flex-row md:gap-10 md:text-start">
        <TriangleAlertIcon className={cn('h-60 w-60 stroke-2 stroke-warning')} />
        <div className="flex h-full flex-col justify-between gap-3 md:gap-4">
          <p className="max-w-sm text-2xl text-md text-warning">{dict('title')}</p>
          <p className="max-w-sm text-md md:text-xl">{dict('description')}</p>
          <div className="flex flex-col justify-center gap-4 md:flex-row md:justify-start">
            <Link href={SOCIALS[Social.Discord].link} prefetch={false}>
              <Button
                size="sm"
                className="w-full"
                variant="outline"
                data-testid={ButtonDataTestId.Maintenance_Discord}
              >
                Discord
              </Button>
            </Link>
            <Link href={SOCIALS[Social.X].link} prefetch={false}>
              <Button
                size="sm"
                className="w-full"
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
