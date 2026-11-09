/** One order line the store could not cover (API 422 `errors[]` when stock ran out). */
export interface StockShortage {
  product_id: number;
  variant_id: number | null;
  product_name?: string;
  requested_quantity: number;
  available_quantity: number;
}

interface OrderErrorBody {
  message?: string;
  errors?: unknown;
}

/** Stock shortages from an order error response, or [] when the error is about something else. */
export function stockShortages(errors: unknown): StockShortage[] {
  if (!Array.isArray(errors)) return [];
  return errors.filter(
    (e): e is StockShortage =>
      !!e && typeof e === "object" && "available_quantity" in e && "requested_quantity" in e
  );
}

export function shortageText(s: StockShortage): string {
  const name = s.product_name || "This item";
  return s.available_quantity <= 0
    ? `${name} is sold out`
    : `Only ${s.available_quantity} left of ${name} (you asked for ${s.requested_quantity})`;
}

/** A readable message for a failed order request. */
export function orderErrorMessage(data: OrderErrorBody | undefined, fallback: string): string {
  const shortages = stockShortages(data?.errors);
  if (shortages.length) return shortages.map(shortageText).join(" · ");
  if (data?.message) return data.message;
  if (data?.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
    const first = Object.values(data.errors as Record<string, unknown>).flat()[0];
    if (typeof first === "string") return first;
  }
  return fallback;
}

/**
 * Key for one checkout attempt. The server creates one order per key, so a double tap, a retry after a timeout
 * or a re-sent request returns the same order instead of taking the stock twice.
 */
export function newIdempotencyKey(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

/** Whether the same attempt may be retried with its key (network error, busy, server error) or needs a new one. */
export function keepKeyAfterError(status: number | undefined): boolean {
  return status === undefined || status === 409 || status >= 500;
}
