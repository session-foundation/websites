'use client';

import { getDateFromUnixTimestampSeconds } from '@session/util-js/date';
import {
  type FormatDistanceStrictOptions,
  type FormatDistanceToNowStrictOptions,
  formatDistanceStrict,
  formatDistanceToNowStrict,
} from 'date-fns';
import { useLocale as _useLocale } from 'next-intl';
import { type Locale, getDateFnsLocale } from './locale-util';

export const useLocale = _useLocale as () => Locale;

export const formatLocalizedRelativeTimeClient = (
  date: Date,
  baseDate: Date,
  options?: Omit<FormatDistanceStrictOptions, 'locale'>
) => {
  const locale = useLocale();
  return formatDistanceStrict(date, baseDate, {
    locale: getDateFnsLocale(locale),
    ...options,
  });
};

export const formatLocalizedRelativeTimeToNowClient = (
  date: Date,
  options?: Omit<FormatDistanceToNowStrictOptions, 'locale'>
) => {
  const locale = useLocale();
  return formatDistanceToNowStrict(date, {
    locale: getDateFnsLocale(locale),
    ...options,
  });
};

export const formatLocalizedTimeFromSeconds = (
  seconds: number,
  options?: Omit<FormatDistanceStrictOptions, 'locale'>
) =>
  formatLocalizedRelativeTimeClient(getDateFromUnixTimestampSeconds(seconds), new Date(0), options);

export const formatNumber = (num: number, options?: Intl.NumberFormatOptions) => {
  return new Intl.NumberFormat(undefined, options).format(num);
};

export const formatPercentage = (num: number, options?: Intl.NumberFormatOptions) => {
  return formatNumber(num, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });
};

export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions, locale?: Locale) => {
  return new Intl.DateTimeFormat(locale, options).format(date);
};

export const useFormatDate = (
  date?: Date | null,
  options?: Intl.DateTimeFormatOptions,
  fallback?: string | null
) => {
  const locale = useLocale();
  if (!date) return fallback ?? null;
  return formatDate(date, options, locale);
};

export const formatList = (list: Array<string>, options?: Intl.ListFormatOptions) => {
  const locale = useLocale();
  return new Intl.ListFormat(locale, options).format(list);
};

export type DecimalDelimiter = '.' | ',';

export const useDecimalDelimiter = (): DecimalDelimiter => {
  const locale = useLocale();
  const decimal = Intl.NumberFormat(locale)
    .formatToParts(1.1)
    ?.find((part) => part.type === 'decimal')?.value;
  if (decimal) return decimal as DecimalDelimiter;
  return (1.1).toLocaleString().substring(1, 2) as DecimalDelimiter;
};
