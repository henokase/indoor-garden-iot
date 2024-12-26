export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return 'ETB 0.00';
  return new Intl.NumberFormat('am-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currencyDisplay: 'symbol'
  }).format(amount);
};

export const formatNumber = (number, decimals = 2) => {
  if (!number || isNaN(number)) return '0';
  return Number(number).toFixed(decimals);
};

export const getEfficiencyStatus = (efficiency) => {
  if (isNaN(efficiency)) return 'N/A';
  if (efficiency >= 10) return 'Optimal';
  if (efficiency >= 0) return 'Good';
  return 'Needs Improvement';
};
