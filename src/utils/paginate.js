/**
 * ============================================================
 * Crudier CRM — Pagination Utility
 * ============================================================
 */

/**
 * Returns paginated query options and formatting metadata.
 * 
 * @param {Object} query - Express req.query object
 * @returns {Object} { limit, skip, page }
 */
const getPaginationOptions = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  return { limit, skip, page };
};

/**
 * Formats a paginated list response.
 * 
 * @param {Array} results - Query results array
 * @param {number} totalCount - Total documents matching search criteria
 * @param {number} page - Current page number
 * @param {number} limit - Current limit
 * @returns {Object} { results, page, limit, totalPages, totalCount }
 */
const formatPaginatedResponse = (results, totalCount, page, limit) => {
  const totalPages = Math.ceil(totalCount / limit);
  return {
    results,
    page,
    limit,
    totalPages,
    totalCount,
  };
};

module.exports = {
  getPaginationOptions,
  formatPaginatedResponse,
};
