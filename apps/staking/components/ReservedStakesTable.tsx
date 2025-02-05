'use client';

import { PubKey } from '@session/ui/components/PubKey';
import { formatPercentage } from '@/lib/locale-client';
import { TOKEN } from '@session/contracts';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@session/ui/ui/table';
import { bigIntToNumber } from '@session/util-crypto/maths';
import { useTranslations } from 'next-intl';
import { type ReactNode, useMemo } from 'react';
import type { ReservedContributorStruct } from '@/hooks/useCreateOpenNodeRegistration';
import { SESSION_NODE_FULL_STAKE_AMOUNT } from '@/lib/constants';
import { NodeOperatorIndicator } from '@/components/StakedNodeCard';
import { cn } from '@session/ui/lib/utils';
import { formatSENTBigIntNoRounding } from '@session/contracts/hooks/Token';
import { ActionModuleTooltip } from '@/components/ActionModule';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { areHexesEqual } from '@session/util-crypto/string';
import { EditButton } from '@session/ui/components/EditButton';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { RemoveButton } from '@session/ui/components/RemoveButton';

type ReservedStakeRow = ReservedContributorStruct & { percentage: number };

export function ReservedStakesTable({
  actionButton,
  children,
  className,
  editRowOnClick,
  isEditable,
  removeRowOnClick,
  reservedStakes,
}: {
  actionButton?: ReactNode;
  children?: ReactNode;
  className?: string;
  editRowOnClick?: (i: number) => void;
  isEditable?: boolean;
  removeRowOnClick?: (i: number) => void;
  reservedStakes: Array<ReservedContributorStruct>;
}) {
  const dict = useTranslations('actionModules.registration.reserveSlotsInput');
  const dictGeneral = useTranslations('general');
  const { address } = useWallet();

  const [slotRows, unreservedStake] = useMemo(() => {
    const rows: Array<ReservedStakeRow> = [];
    let remaining = SESSION_NODE_FULL_STAKE_AMOUNT;

    reservedStakes.forEach(({ amount, addr }) => {
      remaining -= amount;
      rows.push({
        addr,
        amount,
        percentage:
          bigIntToNumber(amount, TOKEN.DECIMALS) /
          bigIntToNumber(SESSION_NODE_FULL_STAKE_AMOUNT, TOKEN.DECIMALS),
      });
    });

    return [rows, remaining];
  }, [reservedStakes]);

  const remainingStake = formatSENTBigIntNoRounding(unreservedStake);
  const remainingStakePercent = formatPercentage(
    bigIntToNumber(unreservedStake, TOKEN.DECIMALS) /
      bigIntToNumber(SESSION_NODE_FULL_STAKE_AMOUNT, TOKEN.DECIMALS),
    { minimumFractionDigits: 0 }
  );

  return (
    <div className={cn('relative', className)}>
      <div className="border-session-text relative overflow-hidden rounded-xl border">
        <Table size="compact">
          <TableHeader>
            <TableRow className="border-b-transparent bg-transparent hover:bg-transparent">
              <TableHead />
              <TableHead className="ps-0">{dict('address')}</TableHead>
              <TableHead>{dict('stakeAmount')}</TableHead>
              <TableHead>{dict('percentage')}</TableHead>
              {isEditable ? <TableHead /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {slotRows.map(({ addr, amount, percentage }, i) => (
              <TableRow key={addr}>
                <TableCell>
                  <div className="-me-3 ms-auto w-max">
                    {i === 0 ? (
                      <NodeOperatorIndicator
                        isOperatorConnectedWallet={areHexesEqual(address, addr)}
                      />
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-row items-center justify-start gap-2 ps-0 align-middle">
                    {i !== 0 && areHexesEqual(address, addr) ? (
                      <>
                        <span className="font-bold">({dictGeneral('you')})</span>
                        <PubKey pubKey={addr} force="collapse" alwaysShowCopyButton />
                      </>
                    ) : (
                      <PubKey pubKey={addr} force="collapse" alwaysShowCopyButton />
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatSENTBigIntNoRounding(amount)}</TableCell>
                <TableCell>{formatPercentage(percentage, { minimumFractionDigits: 0 })}</TableCell>
                {isEditable ? (
                  <TableCell>
                    {/* Only the last slot can be edited TODO: investigate if we can do out of order mutations. */}
                    {i !== 0 && i === reservedStakes.length - 1 ? (
                      <div className="flex flex-row justify-center gap-1">
                        {editRowOnClick ? (
                          <EditButton
                            data-testid={ButtonDataTestId.Reserved_Stakes_Table_Edit_Row}
                            onClick={() => editRowOnClick(i)}
                          />
                        ) : null}
                        {removeRowOnClick ? (
                          <RemoveButton
                            data-testid={ButtonDataTestId.Reserved_Stakes_Table_Edit_Row}
                            onClick={() => removeRowOnClick(i)}
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="[&>td]:py-3">
              <TableCell colSpan={1} className="px-2.5" />
              <TableCell colSpan={1} className="px-2.5">
                <div className="flex flex-row items-center gap-2">
                  {dict('remainingStake')}
                  <ActionModuleTooltip>
                    {dict(
                      isEditable
                        ? 'remainingStakeCreationDescription'
                        : 'remainingStakeViewDescription',
                      { amount: remainingStake }
                    )}
                  </ActionModuleTooltip>
                </div>
              </TableCell>
              <TableCell className="px-2.5">{remainingStake}</TableCell>
              <TableCell className="px-2.5">{remainingStakePercent}</TableCell>
              {isEditable ? <TableCell></TableCell> : null}
            </TableRow>
            <TableRow className="hover:bg-session-black">
              <TableCell colSpan={isEditable ? 5 : 4} className="px-2.5">
                {children}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      {actionButton ? <div className="absolute -bottom-3 -right-3">{actionButton}</div> : null}
    </div>
  );
}
