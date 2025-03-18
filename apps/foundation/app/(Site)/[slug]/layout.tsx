import { Footer } from '@/components/Footer';
import { getInitialSiteDataForSSR } from '@/lib/sanity/sanity-server';
import type { ReactNode } from 'react';

export default async function UniversalPageLayout({ children }: { children: ReactNode }) {
  const { settings } = await getInitialSiteDataForSSR();
  return (
    <>
      {children}
      <Footer className="max-w-screen-md" {...settings} />
    </>
  );
}
