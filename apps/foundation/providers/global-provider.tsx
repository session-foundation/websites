import LocalizationProvider, {
  type LocalizationProviderProps,
} from '@/providers/localization-provider';
import '@session/ui/styles';
import { SANITY_UTIL_PATH } from '@/lib/constants';
import SanityLayout from '@session/sanity-cms/components/SanityLayout';
import type { ReactNode } from 'react';

type GlobalProviderParams = Pick<LocalizationProviderProps, 'locale' | 'messages'> & {
  children: ReactNode;
};

export function GlobalProvider({ children, messages, locale }: GlobalProviderParams) {
  return (
    <LocalizationProvider messages={messages} locale={locale}>
      <SanityLayout disableDraftModePath={SANITY_UTIL_PATH.DISABLE_DRAFT}>{children}</SanityLayout>
    </LocalizationProvider>
  );
}
