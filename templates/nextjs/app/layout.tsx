import { getLocalizationData } from '@/lib/locale-server';
import { MonumentExtended, RobotoFlex, SourceSerif } from '@session/ui/fonts';
import '@session/ui/styles';
import { GlobalProvider } from '@/providers/global-provider';
import { ReactNode } from 'react';
import { cn } from '@session/ui/lib/utils';
import DevSheetServerSide from '@/components/DevSheetServerSide';
import { isProduction } from '@session/util-js/env';

export const metadata = {
  title: 'nextjs',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { locale, direction, messages } = await getLocalizationData();

  return (
    <html
      lang={locale}
      dir={direction}
      className={cn(RobotoFlex.variable, SourceSerif.variable, MonumentExtended.variable)}
    >
      <GlobalProvider messages={messages} locale={locale}>
        <body className="bg-session-white font-roboto-flex text-session-text-black mx-4 flex flex-col items-center overflow-x-hidden">
          {children}
          {!isProduction() ? <DevSheetServerSide /> : null}
        </body>
      </GlobalProvider>
    </html>
  );
}
