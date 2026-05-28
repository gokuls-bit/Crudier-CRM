/**
 * ============================================================
 * Crudier CRM — Excel Export Utility
 * ============================================================
 * Converts collections of database records into an Excel-compatible
 * HTML/XML format that Microsoft Excel opens as a native spreadsheet.
 */

/**
 * Converts array of objects into Excel format.
 * @param {Array<Object>} data – data records
 * @param {Object} headers – header mapping { fieldKey: 'Display Label' }
 * @returns {string} Excel HTML markup
 */
const exportToExcel = (data, headers) => {
  if (!data) return '';

  const headerKeys = Object.keys(headers);
  const headerLabels = Object.values(headers);

  // Excel XML header wrapper to declare workbook name and enable gridlines
  let excelXML = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ';
  excelXML += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
  excelXML += 'xmlns="http://www.w3.org/TR/REC-html40">';
  excelXML += '<head><meta charset="utf-8"/>';
  excelXML += '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>';
  excelXML += '<x:Name>Crudier CRM Report</x:Name>';
  excelXML += '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>';
  excelXML += '</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
  excelXML += '</head>';
  excelXML += '<body><table border="1">';

  // Write headers
  excelXML += '<tr>';
  for (const label of headerLabels) {
    excelXML += `<th style="background-color: #f2f2f2; font-weight: bold; border: 1px solid #dddddd; padding: 8px; text-align: left;">${label}</th>`;
  }
  excelXML += '</tr>';

  // Write data rows
  for (const item of data) {
    excelXML += '<tr>';
    for (const key of headerKeys) {
      const val = item[key] !== undefined && item[key] !== null ? String(item[key]) : '';
      excelXML += `<td style="border: 1px solid #dddddd; padding: 8px;">${val}</td>`;
    }
    excelXML += '</tr>';
  }

  excelXML += '</table></body></html>';
  return excelXML;
};

module.exports = { exportToExcel };
