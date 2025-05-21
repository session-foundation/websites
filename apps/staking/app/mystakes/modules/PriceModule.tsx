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
  const autoRefresh = getItem(PREFERENCE.AUTO_REFRESH_BACKEND);
  return useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      const res = await fetch(`/api/network/prices/${NEXT_PUBLIC_PRICE_TOKEN}/7d`);

      if (!res.ok) {
        toast.error('Failed to fetch price data.');
      }

      const rawData = pricesSchema
        .parse(await res.json())
        .prices.reverse()
        .map(({ price, t }) => ({
          price: Number(price.toFixed(3)),
          t: Math.trunc(t),
        }));

      const filteredData = rawData.filter((_, i) => i % 20 === 0);

      const latestPriceRaw = rawData[rawData.length - 1];
      const latestPriceFiltered = filteredData[filteredData.length - 1];

      if (latestPriceRaw && latestPriceFiltered && latestPriceRaw.t !== latestPriceFiltered.t) {
        filteredData.push(latestPriceRaw);
      }

      return filteredData;
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

  return (
    <Module size="lg" className="flex max-h-52 flex-grow md:max-h-full" noPadding>
      <CardContent className="max-h-full p-0">
        <ModuleTitle className="p-4">
          {titleFormat('format', { title })} {usdFormatted}
        </ModuleTitle>
        <ModuleTooltip>{dictionary.rich('description', { date_time: date })}</ModuleTooltip>
        <ChartContainer
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
              domain={['dataMin', 'dataMax']}
              tickFormatter={(v) => formatUSD(v)}
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
