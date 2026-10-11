// Grams of gold or silver that make up the nisab
export const NISAB_GRAMS = { gold: 87.48, silver: 612.36 };

// Turns a number into money, e.g. 1585 becomes "£1,585.00"
export function formatMoney(amount, symbol = "£") {
  return symbol + amount.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}