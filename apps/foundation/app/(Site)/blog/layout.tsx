import { Footer } from '@/components/Footer';
import { generateRssFeed } from '@/lib/rss';
import { getInitialSiteDataForSSR } from '@/lib/sanity/sanity-server';
import { client } from '@/lib/sanity/sanity.client';
import { generateSanityMetadata } from '@session/sanity-cms/lib/metadata';
import type { Metadata, ResolvingMetadata } from 'next';
import type { ReactNode } from 'react';

export async function generateMetadata(_: object, parent: ResolvingMetadata): Promise<Metadata> {
  const { settings } = await getInitialSiteDataForSSR();

  await generateRssFeed();

  return settings.blogSeo
    ? await generateSanityMetadata(client, {
        seo: settings.blogSeo,
        parentMetadata: await parent,
        type: 'website',
      })
    : {};
}

export default async function BlogLayout({ children }: { children: ReactNode }) {
  const { settings } = await getInitialSiteDataForSSR();
  return (
    <>
      {children}
      <Footer className="max-w-screen-xl" {...settings} />
    </>
  );
}
