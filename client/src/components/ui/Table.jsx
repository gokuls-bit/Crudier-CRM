import React, { useState } from 'react';
import clsx from 'clsx';
import { ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

export const Table = ({ columns = [], data = [], onRowClick, className, emptyMessage = 'No data available' }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === undefined || bVal === undefined) return 0;
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [data, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className={clsx('w-full overflow-x-auto rounded-lg border border-[#E0E3E8] bg-white custom-scrollbar', className)}>
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#F4F5F7] border-b border-[#E0E3E8]">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && requestSort(col.key)}
                className={clsx(
                  'px-4 py-3 font-semibold text-[#1C2945] Outfit',
                  col.sortable && 'cursor-pointer select-none hover:text-[#00A9CE]',
                  col.className
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span>{col.label}</span>
                  {col.sortable && (
                    sortConfig.key === col.key ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-[#00A9CE]" /> : <ChevronDown className="w-3 h-3 text-[#00A9CE]" />
                    ) : <ArrowUpDown className="w-3 h-3 text-slate-500 hover:text-slate-400" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E0E3E8]">
          {sortedData.length > 0 ? (
            sortedData.map((row, idx) => (
              <tr
                key={row._id || row.id || idx}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  'hover:bg-slate-50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={clsx('px-4 py-3 text-slate-700 font-medium', col.className)}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default Table;
