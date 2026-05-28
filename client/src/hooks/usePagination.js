import { useState, useMemo } from 'react';

export const usePagination = (items = [], initialPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Auto reset page if index goes out of range
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  }, [items, currentPage, pageSize]);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToPage = (page) => {
    const pageNum = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNum);
  };

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage,
    goToPage,
    setPageSize,
  };
};
export default usePagination;
