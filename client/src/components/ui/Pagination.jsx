import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export const Pagination = ({ currentPage, totalPages, onPageChange, className }) => {
  if (totalPages <= 1) return null;

  return (
    <div className={clsx('flex items-center justify-between py-3 px-4 border-t border-white/5 bg-slate-900/20 rounded-b-lg', className)}>
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-white/10 text-xs font-semibold rounded-md text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-white/10 text-xs font-semibold rounded-md text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between text-xs text-slate-400">
        <div>
          <p>
            Page <span className="font-semibold text-slate-200">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-200">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-white/10 bg-slate-800 text-xs font-semibold text-slate-400 hover:bg-slate-700 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={clsx(
                  'relative inline-flex items-center px-3.5 py-2 border border-white/10 text-xs font-semibold',
                  page === currentPage
                    ? 'z-10 bg-brand-600 text-white border-brand-500'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                )}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-white/10 bg-slate-800 text-xs font-semibold text-slate-400 hover:bg-slate-700 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
export default Pagination;
