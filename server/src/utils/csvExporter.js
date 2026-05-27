/**
 * ============================================================
 * Crudier CRM — CSV Export Utility
 * ============================================================
 * Converts collections of database results (such as tasks, leads,
 * or attendance reports) into comma-separated value strings.
 */

/**
 * Converts array of objects into CSV format.
 * @param {Array<Object>} data – data records
 * @param {Object} headers – header mapping { fieldKey: 'Display Label' }
 * @returns {string} CSV text
 */
const exportToCSV = (data, headers) => {
  if (!data || data.length === 0) return '';

  const headerKeys = Object.keys(headers);
  const headerLabels = Object.values(headers);

  const csvRows = [];

  // Add the header row
  csvRows.push(
    headerLabels
      .map((label) => `"${label.replace(/"/g, '""')}"`)
      .join(',')
  );

  // Add the data rows
  for (const item of data) {
    const rowValues = headerKeys.map((key) => {
      const value = item[key] !== undefined && item[key] !== null ? String(item[key]) : '';
      // Escape double quotes inside values
      return `"${value.replace(/"/g, '""')}"`;
    });
    csvRows.push(rowValues.join(','));
  }

  return csvRows.join('\n');
};

module.exports = { exportToCSV };
