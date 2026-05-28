export const formatCurrency = (value, currency = 'USD', locale = 'en-US') => {
  const numValue = Number(value);
  if (isNaN(numValue)) return '$0';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numValue);
};

export const formatCompactNumber = (value) => {
  const numValue = Number(value);
  if (isNaN(numValue)) return '0';

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(numValue);
};
export default formatCurrency;
