import { siteMetadata } from '@/lib/metadata';
import { HomeIcon } from '@session/ui/icons/HomeIcon';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export async function generateMetadata() {
  const dictionary = await getTranslations('metadata.notFound');
  return siteMetadata({
    title: dictionary('title'),
    description: dictionary('description'),
  });
}

export default function NotFound() {
  const dictionary = useTranslations('notFound');
  return (
    <div className="-mt-header-displacement flex h-screen w-full items-center justify-center p-32 align-middle">
      <div className="flex flex-col items-center justify-center text-center align-middle md:flex-row md:gap-10 md:text-left lg:h-[140px]">
        <span className="font-bold font-monument-extended text-9xl leading-none lg:mt-[-30px] lg:max-h-[140px] lg:text-[192px]">
          404
        </span>
        <div className="m-0 hidden h-full w-px bg-text-primary p-0 lg:block" />
        <div className="flex h-full flex-col justify-between gap-4 md:gap-0">
          <p className="max-w-[380px] text-xl md:text-2xl">{dictionary('description')}</p>
          <Link href="/" prefetch={false}>
            <Button size="lg" variant="outline" className="group" data-testid="button:not-found">
              <HomeIcon className="mr-2 h-6 w-6 fill-session-green group-hover:fill-session-black" />{' '}
              {dictionary('homeButton')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
