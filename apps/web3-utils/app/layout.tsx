import { siteMetadata } from '@/lib/metadata';
import { MonumentExtended, RobotoFlex } from '@session/ui/fonts';
import '@session/ui/styles';
import { Footer } from '@/components/Footer';
import Header from '@/components/Header';
import ScreenContainer from '@/components/ScreenContainer';
import { WalletUserSheet } from '@/components/WalletUserSheet';
import { NEXT_PUBLIC_BRANDED } from '@/lib/env';
import { getLocalizationData } from '@/lib/locale-server';
import { GlobalProvider } from '@/providers/global-provider';
import { cn } from '@session/ui/lib/utils';
import { Toaster } from '@session/ui/ui/sonner';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

export async function generateMetadata() {
  return await siteMetadata({});
}

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
        <body className="overflow-x-hidden bg-session-black font-roboto-flex text-session-text">
          <Header />
          <main>
            <ScreenContainer>{children}</ScreenContainer>
            {NEXT_PUBLIC_BRANDED ? <Footer /> : null}
          </main>
          <WalletUserSheet />
          <Toaster />
        </body>
      </GlobalProvider>
    </html>
  );
}
