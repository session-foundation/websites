'use client';

import { Module, ModuleTitle, ModuleTooltip } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from '@session/ui/lib/recharts';

import { BACKEND, PREFERENCE } from '@/lib/constants';
import { NEXT_PUBLIC_PRICE_TOKEN } from '@/lib/env';
import { formatDate, formatUSD } from '@/lib/locale-client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@session/ui/components/ui/chart';
import { toast } from '@session/ui/lib/toast';
import { CardContent } from '@session/ui/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { usePreferences } from 'usepref';
import { z } from 'zod';

const pricesSchema = z.object({
  prices: z.array(
    z.object({
      price: z.number(),
      t: z.number(),
    })
  ),
});

const useHistoricalPriceQuery = () => {
  const { getItem } = usePreferences();
  const autoRefresh = !getItem(PREFERENCE.DISABLE_BACKEND_AUTO_REFRESH);
  return useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      const res = await fetch(`/api/network/prices/${NEXT_PUBLIC_PRICE_TOKEN}/7d`);

      if (!res.ok) {
        toast.error('Failed to fetch price data.');
      }

      return pricesSchema
        .parse(await res.json())
        .prices.reverse()
        .map(({ price, t }) => ({
          price: Number(price.toFixed(3)),
          t: Math.trunc(t),
        }));
    },
    refetchInterval: autoRefresh ? BACKEND.NODE_TARGET_UPDATE_INTERVAL_SECONDS * 1000 : false,
  });
};

const formatPriceTimeMedium = (unixSeconds: number) =>
  formatDate(new Date(unixSeconds * 1000), { dateStyle: 'medium', timeStyle: 'short' });

const formatPriceDateShort = (unixSeconds: number) =>
  formatDate(new Date(unixSeconds * 1000), { month: 'numeric', day: 'numeric' });

export default function PriceModule() {
  const dictionary = useTranslations('modules.price');
  const titleFormat = useTranslations('modules.title');
  const title = dictionary('title');

  const { data } = useHistoricalPriceQuery();

  const price = data?.length ? data[data.length - 1] : undefined;
  const usdFormatted = formatUSD(price?.price ?? 0);
  const date = useMemo(() => (price ? formatPriceTimeMedium(price.t) : null), [price]);

  const range = useMemo(() => {
    const range = { min: 0, max: 0 };
    if (data) {
      range.min = Number.POSITIVE_INFINITY;
      range.max = Number.NEGATIVE_INFINITY;
      for (const p of data) {
        if (p.price < range.min) {
          range.min = p.price;
        }
        if (p.price > range.max) {
          range.max = p.price;
        }
      }

      const diff = range.max - range.min;
      range.max = Math.ceil((range.max + diff * 0.25) * 100) / 100;
      range.min = Math.floor((range.min - diff * 0.25) * 100) / 100;
    }
    return range;
  }, [data]);

  return (
    <Module size="lg" className="flex max-h-52 flex-grow md:max-h-full" noPadding>
      <CardContent className="max-h-full p-0">
        <ModuleTitle className="p-4">
          {titleFormat('format', { title })} {usdFormatted}
        </ModuleTitle>
        <ModuleTooltip>{dictionary.rich('description', { date_time: date })}</ModuleTooltip>
        <ChartContainer
          className="hidden md:block"
          config={{
            price: {
              label: 'Price',
              color: 'var(--session-green)',
            },
          }}
        >
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: -10,
              right: 12,
              top: 12,
              bottom: 62,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="t"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tickFormatter={(value) => formatPriceDateShort(value)}
              fontSize={10}
            />
            <YAxis
              dataKey="price"
              domain={[range.min, range.max]}
              tickFormatter={(v) => formatUSD(v)}
              tickCount={20}
              fontSize={10}
            />
            <ChartTooltip
              cursor={true}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => formatPriceTimeMedium(payload[0]?.payload.t)}
                  valueFormatter={(v) =>
                    typeof v === 'number' ? formatUSD(v) : v.toLocaleString()
                  }
                />
              }
            />
            <Line
              dataKey="price"
              type="natural"
              stroke="var(--color-price)"
              strokeWidth={2}
              dot={{
                r: 0,
              }}
              activeDot={{
                r: 5,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Module>
  );
}
