import { formatUnits, parseUnits } from "viem/utils";

/** Oracle feed prices (target, live and snapshot) use 8 decimals. */
export const PRICE_DECIMALS = 8;

/** Convert a user-entered USD price into the oracle's 8-decimal unit. */
export function parsePrice(value: string): bigint {
  return parseUnits(value.trim(), PRICE_DECIMALS);
}

/**
 * Convert a raw feed price into a number suitable for display math.
 *
 * Values are narrowed at runtime because the bundled JSON ABI does not infer
 * their types.
 */
export function priceToNumber(value?: unknown): number {
  if (typeof value !== "bigint") return 0;
  return Number(formatUnits(value, PRICE_DECIMALS));
}

/** Format a raw feed price for display, including legitimate zero values. */
export function formatPrice(value?: unknown): string {
  if (typeof value !== "bigint") return "—";
  return priceToNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
