import { MonumentExtended, RobotoFlex } from '@session/ui/fonts';
import { siteMetadata } from '@/lib/metadata';
import '@session/ui/styles';
import { getBuildInfo } from '@session/util-js/build';
import Header from '@/components/Header';
import { type ReactNode } from 'react';
import { cn } from '@session/ui/lib/utils';
import { getLocalizationData } from '@/lib/locale-server';
import { headers } from 'next/headers';
import { GlobalProvider } from '@/providers/global-provider';
import WalletUserSheet from '@session/wallet/components/WalletUserSheet';
import { isProduction } from '@/lib/env';
import { DevSheet } from '@/components/DevSheet';
import { TOSHandler } from '@/components/TOSHandler';
import { Toaster } from '@session/ui/ui/sonner';

export async function generateMetadata() {
  return siteMetadata({});
}

const buildInfo = getBuildInfo();

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { locale, direction, messages } = await getLocalizationData();
  const wagmiCookie = (await headers()).get('cookie');

  return (
    <html
      lang={locale}
      dir={direction}
      className={cn(RobotoFlex.variable, MonumentExtended.variable)}
    >
      <GlobalProvider messages={messages} locale={locale} wagmiCookie={wagmiCookie}>
        <body className="bg-session-black font-roboto-flex text-session-text overflow-x-hidden">
          {/*<ChainBanner />*/}
          {/*<Suspense>*/}
          {/*  <RemoteBanner />*/}
          {/*</Suspense>*/}
          <Header />
          <main>{children}</main>
          <WalletUserSheet />
          {!isProduction ? <DevSheet buildInfo={buildInfo} /> : null}
          <TOSHandler />
          <Toaster />
        </body>
      </GlobalProvider>
    </html>
  );
}
