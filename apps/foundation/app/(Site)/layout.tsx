import { getLocalizationData } from '@/lib/locale-server';
import { MonumentExtended, RobotoFlex, SourceSerif } from '@session/ui/fonts';
import '@session/ui/styles';
import DevSheetServerSide from '@/components/DevSheetServerSide';
import Header from '@/components/Header';
import { getInitialSiteDataForSSR } from '@/lib/sanity/sanity-server';
import { client } from '@/lib/sanity/sanity.client';
import { GlobalProvider } from '@/providers/global-provider';
import { generateSanityMetadata } from '@session/sanity-cms/lib/metadata';
import { cn } from '@session/ui/lib/utils';
import { isProduction } from '@session/util-js/env';
import type { Metadata } from 'next';
import Head from 'next/head';
import type { ReactNode } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getInitialSiteDataForSSR();

  const generatedMetadata = settings.seo
    ? await generateSanityMetadata(client, {
        seo: settings.seo,
        type: 'website',
      })
    : {};

  return {
    ...generatedMetadata,
    manifest: '/site.webmanifest',
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { locale, direction, messages } = await getLocalizationData();
  const { settings } = await getInitialSiteDataForSSR();

  return (
    <html
      lang={locale}
      dir={direction}
      className={cn(RobotoFlex.variable, SourceSerif.variable, MonumentExtended.variable)}
    >
      <Head>
        <link rel="icon" type="image/png" href="/favicon-48x48.png" sizes="48x48" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </Head>
      <GlobalProvider messages={messages} locale={locale}>
        <body className="mx-4 flex flex-col items-center overflow-x-hidden bg-session-white font-roboto-flex text-session-text-black">
          <Header {...settings} />
          {children}
          {!isProduction() ? <DevSheetServerSide /> : null}
        </body>
      </GlobalProvider>
    </html>
  );
}
