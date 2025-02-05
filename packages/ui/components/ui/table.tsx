import type { HTMLAttributes } from 'react';
import * as React from 'react';

import { cn, cva } from '../../lib/utils';
import type { VariantProps } from 'class-variance-authority';

const tableVariants = cva('w-full caption-bottom text-sm', {
  variants: {
    size: {
      compact:
        '[&>thead>tr>th]:min-h-10 [&>thead>tr>th]:p-3 [&>thead>tr>th]:px-2 [&>tbody>tr>td]:p-2.5',
      normal:
        '[&>thead>tr>th]:min-h-12 [&>thead>tr>th]:p-5 [&>thead>tr>th]:px-4 [&>tbody>tr>td]:p-4',
      large:
        '[&>thead>tr>th]:min-h-14 [&>thead>tr>th]:p-7 [&>thead>tr>th]:px-6 [&>tbody>tr>td]:p-6',
    },
  },
  defaultVariants: {
    size: 'normal',
  },
});

type TableProps = HTMLAttributes<HTMLTableElement> & VariantProps<typeof tableVariants>;

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, size, ...props }, ref) => (
    <div className="relative overflow-auto">
      <table ref={ref} className={cn(tableVariants({ size, className }))} {...props} />
    </div>
  )
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('bg-[#091D1A] [&_tr]:border-b', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'data-[state=selected]:bg-muted bg-session-black border-session-white hover:bg-gray-darker border-b transition-colors',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'text-session-text text-left align-middle font-medium [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('align-middle [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn('text-muted-foreground mt-4 text-sm', className)} {...props} />
));
TableCaption.displayName = 'TableCaption';

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
