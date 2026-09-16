const NON_BREAKING_SPACE = " ";

/**
 * Formats a number as "12 345 678 руб." per the assignment's required display format.
 * `toLocaleString("ru-RU")` groups digits with U+00A0 (non-breaking space); normalized to a
 * regular space so the output matches the spec literally and is trivial to test/copy.
 */
export function formatCurrency(amount: number): string {
  const grouped = Math.round(amount)
    .toLocaleString("ru-RU")
    .split(NON_BREAKING_SPACE)
    .join(" ");
  return `${grouped} руб.`;
}
