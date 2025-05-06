import { siteMetadata } from '@/lib/metadata';
import { MonumentExtended, RobotoFlex } from '@session/ui/fonts';
import '@session/ui/styles';
import { DevSheet } from '@/components/DevSheet';
import Header from '@/components/Header';
import Maintenance from '@/components/Maintenance';
import RemoteBanner from '@/components/RemoteBanner';
import RouterListener from '@/components/RouterListener';
import { StatusBar } from '@/components/StatusBar';
import { TOSHandler } from '@/components/TOSHandler';
import TestnetBanner from '@/components/TestnetBanner';
import { VestingDialog } from '@/components/Vesting/VestingDialog';
import { WalletUserSheet } from '@/components/WalletUserSheet';
import { NEXT_PUBLIC_TESTNET, isProduction } from '@/lib/env';
import { REMOTE_FEATURE_FLAG } from '@/lib/feature-flags';
import { getRemoteFeatureFlags } from '@/lib/feature-flags-server';
import { getLocalizationData } from '@/lib/locale-server';
import { GlobalProvider } from '@/providers/global-provider';
import { cn } from '@session/ui/lib/utils';
import { Toaster } from '@session/ui/ui/sonner';
import { getBuildInfo } from '@session/util-js/build';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

export async function generateMetadata() {
  return await siteMetadata({});
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
        <body className="overflow-x-hidden bg-session-black font-roboto-flex text-session-text">
          {enabledFlags.has(REMOTE_FEATURE_FLAG.ENABLE_MAINTENANCE_MODE) ? (
            <Maintenance />
          ) : (
            <>
              {NEXT_PUBLIC_TESTNET ? <TestnetBanner /> : null}
              <RemoteBanner enabledFlags={enabledFlags} />
              <Header />
              <main>{children}</main>
              <WalletUserSheet />
              {!isProduction ? <DevSheet buildInfo={buildInfo} /> : null}
              <TOSHandler />
              <VestingDialog />
              <Toaster />
              <StatusBar />
              {!isProduction ? <RouterListener /> : null}
            </>
          )}
        </body>
      </GlobalProvider>
    </html>
  );
}
