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
import { isProduction } from '@/lib/env';
import { DevSheet } from '@/components/DevSheet';
import { TOSHandler } from '@/components/TOSHandler';
import { StatusBar } from '@/components/StatusBar';
import { getRemoteFeatureFlags } from '@/lib/feature-flags-server';
import { REMOTE_FEATURE_FLAG } from '@/lib/feature-flags';
import Maintenance from '@/components/Maintenance';
import RemoteBanner from '@/components/RemoteBanner';
import { WalletUserSheet } from '@/components/WalletUserSheet';
import { Toaster } from '@session/ui/ui/sonner';

export async function generateMetadata() {
  return siteMetadata({});
}

const buildInfo = getBuildInfo();

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { locale, direction, messages } = await getLocalizationData();
  const wagmiCookie = (await headers()).get('cookie');

  /**
   *  We don't need to handle any errors from the remote flag functions as any errors are handled
   *  in the function call, and that call happens on the same thread, as this is server-side rendered.
   */
  const enabledFlags = new Set((await getRemoteFeatureFlags()).flags);

  return (
    <html
      lang={locale}
      dir={direction}
      className={cn(RobotoFlex.variable, MonumentExtended.variable)}
    >
      <GlobalProvider messages={messages} locale={locale} wagmiCookie={wagmiCookie}>
        <body className="bg-session-black font-roboto-flex text-session-text overflow-x-hidden">
          {enabledFlags.has(REMOTE_FEATURE_FLAG.ENABLE_MAINTENANCE_MODE) ? (
            <Maintenance />
          ) : (
            <>
              {/*<ChainBanner />*/}
              <RemoteBanner enabledFlags={enabledFlags} />
              <Header />
              <main>{children}</main>
              <WalletUserSheet />
              {!isProduction ? <DevSheet buildInfo={buildInfo} /> : null}
              <TOSHandler />
              <Toaster />
              <StatusBar />
            </>
          )}
        </body>
      </GlobalProvider>
    </html>
  );
}
