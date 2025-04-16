'use client';

import { ActionModuleTooltip } from '@/components/ActionModule';
import { NodeOperatorIndicator } from '@/components/StakedNodeCard';
import type { ReservedContributorStruct } from '@/hooks/useCreateOpenNodeRegistration';
import { useCurrentActor } from '@/hooks/useCurrentActor';
import { SESSION_NODE_FULL_STAKE_AMOUNT } from '@/lib/constants';
import { formatPercentage } from '@/lib/locale-client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { TOKEN } from '@session/contracts';
import { formatSENTBigIntNoRounding } from '@session/contracts/hooks/Token';
import { EditButton } from '@session/ui/components/EditButton';
import { PubKey } from '@session/ui/components/PubKey';
import { RemoveButton } from '@session/ui/components/RemoveButton';
import { cn } from '@session/ui/lib/utils';
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
import { areHexesEqual } from '@session/util-crypto/string';
import { useTranslations } from 'next-intl';
import { type ReactNode, useMemo } from 'react';

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
  const address = useCurrentActor();

  const [slotRows, unreservedStake] = useMemo(() => {
    const rows: Array<ReservedStakeRow> = [];
    let remaining = SESSION_NODE_FULL_STAKE_AMOUNT;

    for (const { amount, addr } of reservedStakes) {
      remaining -= amount;
      rows.push({
        addr,
        amount,
        percentage:
          bigIntToNumber(amount, TOKEN.DECIMALS) /
          bigIntToNumber(SESSION_NODE_FULL_STAKE_AMOUNT, TOKEN.DECIMALS),
      });
    }

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
      <div className="relative overflow-hidden rounded-xl border border-session-text">
        <Table size="compact">
          <TableHeader>
            <TableRow className="border-b-transparent bg-transparent hover:bg-transparent">
              <TableHead />
              <TableHead className="ps-0">{dict('address')}</TableHead>
              <TableHead className="text-end">{dict('stakeAmount')}</TableHead>
              <TableHead
                className={isEditable && slotRows.length > 1 ? '' : 'text-end'}
                colSpan={isEditable ? 2 : 1}
              >
                {dict('percentage')}
              </TableHead>
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
                <TableCell className="text-end">{formatSENTBigIntNoRounding(amount)}</TableCell>
                <TableCell className="text-end">
                  {formatPercentage(percentage, { minimumFractionDigits: 0 })}
                </TableCell>
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
              <TableCell colSpan={unreservedStake ? 1 : 3} className="px-2.5">
                <div className="flex flex-row items-center gap-2">
                  {dict(unreservedStake ? 'remainingStake' : 'remainingStakeNone')}
                  {unreservedStake ? (
                    <ActionModuleTooltip>
                      {dict(
                        isEditable
                          ? 'remainingStakeCreationDescription'
                          : 'remainingStakeViewDescription',
                        { amount: remainingStake }
                      )}
                    </ActionModuleTooltip>
                  ) : null}
                </div>
              </TableCell>
              {unreservedStake ? (
                <TableCell className="px-2.5 text-end">{remainingStake}</TableCell>
              ) : null}
              {unreservedStake ? (
                <TableCell className="px-2.5 text-end">{remainingStakePercent}</TableCell>
              ) : null}
              {isEditable ? <TableCell /> : null}
            </TableRow>
            <TableRow className="hover:bg-session-black">
              <TableCell colSpan={isEditable ? 5 : 4} className="px-2.5">
                {children}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      {actionButton ? <div className="-bottom-3 -right-3 absolute">{actionButton}</div> : null}
    </div>
  );
}
