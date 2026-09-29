/**
 * Currency, Date and Number Formatting Utilities
 */

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'AU$',
  JPY: '¥',
};

export const getCurrencySymbol = (currencyCode = 'INR') => {
  return CURRENCY_SYMBOLS[currencyCode?.toUpperCase()] || '₹';
};

export const formatCurrency = (amount, currencyCode = 'INR') => {
  const numeric = Number(amount) || 0;
  const symbol = getCurrencySymbol(currencyCode);

  try {
    const formatted = new Intl.NumberFormat(currencyCode === 'INR' ? 'en-IN' : 'en-US', {
      minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(numeric);

    return `${symbol}${formatted}`;
  } catch (err) {
    return `${symbol}${numeric.toLocaleString()}`;
  }
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  }).format(date);
};

export const formatPercentage = (percent) => {
  return `${Math.round(percent || 0)}%`;
};
