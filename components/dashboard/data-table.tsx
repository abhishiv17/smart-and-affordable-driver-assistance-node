'use client';

import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface DataTableColumn<T> {
  /** Column header label */
  header: string;
  /** Key to access data, or a render function */
  accessorKey?: keyof T;
  /** Custom cell renderer */
  cell?: (row: T) => React.ReactNode;
  /** Enable sorting on this column */
  sortable?: boolean;
  /** Column width class */
  className?: string;
}

interface DataTableProps<T> {
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Row data */
  data: T[];
  /** Unique key extractor */
  rowKey: (row: T) => string;
  /** Called when a row is clicked */
  onRowClick?: (row: T) => void;
  /** Additional class */
  className?: string;
  /** Show message when no data */
  emptyMessage?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Reusable data table with sortable columns.
 * Styled for dark operations console aesthetic.
 */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  className,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const cmp = aVal < bVal ? -1 : 1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  function handleSort(key: keyof T) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-12">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto rounded-lg border border-border', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={cn(
                  'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground',
                  col.sortable && col.accessorKey && 'cursor-pointer select-none hover:text-foreground',
                  col.className
                )}
                onClick={() => col.sortable && col.accessorKey && handleSort(col.accessorKey)}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && col.accessorKey && sortKey === col.accessorKey && (
                    sortDir === 'asc'
                      ? <ChevronUp className="h-3 w-3" />
                      : <ChevronDown className="h-3 w-3" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => (
            <tr
              key={rowKey(row)}
              className={cn(
                'border-b border-border/50 transition-colors last:border-b-0',
                onRowClick
                  ? 'cursor-pointer hover:bg-muted/40'
                  : 'hover:bg-muted/20'
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col, idx) => (
                <td key={idx} className={cn('px-4 py-3 text-foreground', col.className)}>
                  {col.cell
                    ? col.cell(row)
                    : col.accessorKey
                      ? String(row[col.accessorKey] ?? '—')
                      : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
