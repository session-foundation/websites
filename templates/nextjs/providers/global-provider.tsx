import LocalizationProvider, { LocalizationProviderProps } from '@/providers/localization-provider';
import '@session/ui/styles';
import type { ReactNode } from 'react';

type GlobalProviderParams = Pick<LocalizationProviderProps, 'locale' | 'messages'> & {
  children: ReactNode;
};

export async function GlobalProvider({ children, messages, locale }: GlobalProviderParams) {
  return (
    <LocalizationProvider messages={messages} locale={locale}>
      {children}
    </LocalizationProvider>
  );
}
