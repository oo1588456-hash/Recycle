/** Must match backend `DEFAULT_CURRENCY` / `NEXT_PUBLIC_DEFAULT_CURRENCY`. */
export const STORE_CURRENCY =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_DEFAULT_CURRENCY) || "GBP";
