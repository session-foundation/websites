'use client';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@session/ui/lib/toast';
import { PubKey } from '@session/ui/components/PubKey';
import { formatNumber, formatPercentage } from '@/lib/locale-client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@session/ui/ui/table';
import Typography from '@session/ui/components/Typography';
import { useWallet } from '@session/wallet/hooks/wallet-hooks';
import { areHexesEqual } from '@session/util-crypto/string';
import Link from 'next/link';
import { Loading } from '@session/ui/components/loading';
import { cn } from '@session/ui/lib/utils';

// TODO: Delete route after testnet incentive program is over

function smartFormatPercentage(decimalPercent: number) {
  const maximumFractionDigits = decimalPercent > 0.0001 ? 4 : 6;
  return formatPercentage(decimalPercent, { maximumFractionDigits });
}

export default function PointsPage() {
  const { address } = useWallet();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['points'],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_POINTS_PROGRAM_API!);

      if (!res.ok) {
        toast.error('Failed to fetch points');
      }

      const data = await res.json();

      return (
        Object.entries(data.wallets) as Array<
          [
            string,
            {
              score: number;
              percent: number;
            },
          ]
        >
      ).sort((a, b) => b[1].score - a[1].score);
    },
  });

  return (
    <div className="mt-10 flex flex-col items-center gap-6">
      <div className="flex max-w-xl flex-col items-center gap-4 text-center">
        <Typography variant="h1">Testnet Leaderboard</Typography>
        <Typography variant="p">
          Track the top-performing wallets in the{' '}
          <Link
            target="_blank"
            href="https://token.getsession.org/testnet-incentive-program"
            className="text-session-green underline"
          >
            Session Testnet Incentive Program
          </Link>
          . Rankings are based on total points earned through running and staking to nodes.
        </Typography>
      </div>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <span>Something went wrong</span>
      ) : (
        <Table className="w-max max-w-[90vw]">
          <TableHeader>
            <TableRow className="text-sm md:text-lg">
              <TableHead className="hidden sm:block">Rank</TableHead>
              <TableHead>Wallet Address</TableHead>
              <TableHead>Points</TableHead>
              <TableHead className="text-right">Percent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map(([wallet, { score, percent }], i) => (
              <TableRow
                key={wallet}
                className={cn(
                  'text-sm md:text-base',
                  areHexesEqual(wallet, address)
                    ? 'bg-session-green text-session-black hover:bg-session-green-dark'
                    : 'hover:bg-session-green hover:text-session-black hover:selection:bg-session-black hover:selection:text-session-green'
                )}
              >
                <TableCell className="hidden font-bold sm:block">{i + 1}</TableCell>
                <TableCell className="w-max">
                  <PubKey pubKey={wallet} />
                </TableCell>
                <TableCell>{formatNumber(score)}</TableCell>
                <TableCell className="p-0 py-4 pr-1 text-right md:pe-1">
                  {smartFormatPercentage(percent / 10000)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
