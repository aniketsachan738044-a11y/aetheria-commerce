/**
 * Formats a numeric value into standard Indian Currency (INR - ₹)
 * Examples:
 * 129990 -> ₹1,29,990
 * 520 -> ₹520
 */
export const formatINR = (amount) => {
  if (typeof amount !== 'number') {
    amount = Number(amount) || 0;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
