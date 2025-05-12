'use client';

import { TICKER } from '@/lib/constants';
import { formatLocalizedRelativeTimeToNowClient } from '@/lib/locale-client';
import { TOKEN } from '@session/contracts';
import { PubKey } from '@session/ui/components/PubKey';
import { LinkOutIcon } from '@session/ui/icons/LinkOutIcon';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@session/ui/ui/table';
import { formatBigIntTokenValue } from '@session/util-crypto/maths';
import { ETH } from '@session/wallet/lib/eth';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo } from 'react';
import type { TransactionHistory } from './utils';

interface TransactionRow {
  date: Date;
  hash: string;
  amount: string;
  token: TOKEN.SYMBOL | TICKER.ETH;
}

export function FaucetTransactions({
  transactionHistory,
}: {
  transactionHistory: Array<TransactionHistory>;
}) {
  const dictionary = useTranslations('general');
  const transactionsDictionary = useTranslations('faucet.transactions');

  const transactions = useMemo(() => {
    const rows: Array<TransactionRow> = [];

    transactionHistory.forEach(({ timestamp, hash, amount, ethhash, ethamount }) => {
      if (ethhash && ethamount) {
        rows.push({
          date: new Date(timestamp),
          hash: ethhash,
          amount: ethamount,
          token: TICKER.ETH,
        });
      }

      if (hash && amount) {
        rows.push({
          date: new Date(timestamp),
          hash,
          amount,
          token: TOKEN.SYMBOL,
        });
      }
    });
    return rows;
  }, [transactionHistory]);

  return (
    <div className="overflow-hidden rounded-xl border border-session-text">
      <Table className="bg-transparent">
        <TableCaption className="pb-3">{transactionsDictionary('tableCaption')}</TableCaption>
        <TableHeader>
          <TableRow className="border-b-transparent">
            <TableHead className="hidden md:table-cell">{transactionsDictionary('when')}</TableHead>
            <TableHead className="hidden md:table-cell">{transactionsDictionary('hash')}</TableHead>
            <TableHead>{transactionsDictionary('amount')}</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map(({ date, hash, amount, token }) => (
            <TableRow key={hash}>
              <TableCell className="hidden font-medium md:table-cell">
                {formatLocalizedRelativeTimeToNowClient(date, { addSuffix: true })}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <PubKey pubKey={hash} force="collapse" alwaysShowCopyButton />
              </TableCell>
              <TableCell>
                {formatBigIntTokenValue(
                  BigInt(amount),
                  token === TOKEN.SYMBOL ? TOKEN.DECIMALS : ETH.DECIMALS
                )}
                {` ${token}`}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/explorer/arbitrum/tx/${hash}`} target="_blank">
                  <span className="inline-flex w-max items-center gap-1 fill-session-green align-middle text-session-green">
                    <span className="hidden 2xl:flex">{dictionary('viewOnExplorer')}</span>
                    <span className="flex 2xl:hidden">{dictionary('viewOnExplorerShort')}</span>
                    <LinkOutIcon className="h-4 w-4" />
                  </span>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
