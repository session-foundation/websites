'use client';

import { Module, ModuleTitle, ModuleTooltip } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from '@session/ui/lib/recharts';

import { CardContent } from '@session/ui/components/ui/card';

import { BACKEND, PREFERENCE } from '@/lib/constants';
import { formatDate, formatUSD } from '@/lib/locale-client';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@session/ui/components/ui/chart';
import { toast } from '@session/ui/lib/toast';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { usePreferences } from 'usepref';
import { z } from 'zod';

const chartConfig = {
  price: {
    label: 'Price',
    color: 'var(--session-green)',
  },
} satisfies ChartConfig;

const pricesSchema = z.object({
  prices: z.array(
    z.object({
      price: z.number(),
      t: z.number(),
    })
  ),
});

const formatPriceTimeMedium = (unixSeconds: number) =>
  formatDate(new Date(unixSeconds * 1000), { dateStyle: 'medium', timeStyle: 'short' });
const formatPriceTimeShort = (unixSeconds: number) =>
  formatDate(new Date(unixSeconds * 1000), { dateStyle: 'short', timeStyle: 'short' });

export default function PriceModule() {
  const showAxis = false;
  const dictionary = useTranslations('modules.price');
  const titleFormat = useTranslations('modules.title');
  const title = dictionary('title');

  const { getItem } = usePreferences();

  const autoRefresh = getItem(PREFERENCE.AUTO_REFRESH_BACKEND);

  const { data } = useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      const oneWeekAgo = Math.trunc(Date.now() / 1000) - 7 * 24 * 60 * 60;
      const res = await fetch(`/api/network/prices/chainflip/${oneWeekAgo}`);

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

  const price = data?.length ? data[data.length - 1] : undefined;
  const usdFormatted = formatUSD(price?.price ?? 0);
  const date = useMemo(() => (price ? formatPriceTimeMedium(price.t) : null), [price]);

  return (
    <Module size="lg" className="flex max-h-52 flex-grow md:max-h-full" noPadding>
      <CardContent
        className="p-0"
        style={{
          maxHeight: '100%',
        }}
      >
        <ModuleTitle className="p-4">
          {titleFormat('format', { title })} {usdFormatted}
        </ModuleTitle>
        <ModuleTooltip>{dictionary.rich('description', { date_time: date })}</ModuleTooltip>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: showAxis ? -10 : 12,
              right: 12,
              top: 8,
              bottom: showAxis ? 60 : 72,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="t"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tickFormatter={(value) => formatPriceTimeShort(value)}
              fontSize={10}
              hide={!showAxis}
            />
            <YAxis
              dataKey="price"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(v) => formatUSD(v)}
              fontSize={10}
              hide={!showAxis}
            />
            <ChartTooltip
              cursor={true}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => formatPriceTimeMedium(payload[0]?.payload.t)}
                  valueFormatter={(v) => formatUSD(v)}
                />
              }
            />
            <Line
              dataKey="price"
              type="natural"
              stroke="var(--color-price)"
              strokeWidth={2}
              dot={{
                fill: 'var(--color-price)',
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
