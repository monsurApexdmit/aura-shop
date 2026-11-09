import { describe, expect, it } from "vitest";
import { keepKeyAfterError, newIdempotencyKey, orderErrorMessage, stockShortages } from "./orderErrors";

const shortage = { product_id: 7, variant_id: null, product_name: "Linen Shirt", requested_quantity: 5, available_quantity: 3 };

describe("orderErrors", () => {
  it("reads stock shortages from a 422 body", () => {
    expect(stockShortages([shortage])).toEqual([shortage]);
    expect(stockShortages({ phone: ["Required"] })).toEqual([]);
    expect(stockShortages(undefined)).toEqual([]);
  });

  it("explains each short line", () => {
    expect(orderErrorMessage({ message: "Insufficient stock", errors: [shortage] }, "x")).toBe(
      "Only 3 left of Linen Shirt (you asked for 5)"
    );
    expect(orderErrorMessage({ errors: [{ ...shortage, available_quantity: 0 }] }, "x")).toBe("Linen Shirt is sold out");
  });

  it("falls back to the message, then the first field error, then the fallback", () => {
    expect(orderErrorMessage({ message: "Choose a delivery option" }, "x")).toBe("Choose a delivery option");
    expect(orderErrorMessage({ errors: { phone: ["Phone is required"] } }, "x")).toBe("Phone is required");
    expect(orderErrorMessage(undefined, "Try again")).toBe("Try again");
  });

  it("makes a fresh key each time", () => {
    expect(newIdempotencyKey()).not.toBe(newIdempotencyKey());
  });

  it("keeps the key only for errors where the order may already exist", () => {
    expect(keepKeyAfterError(undefined)).toBe(true);
    expect(keepKeyAfterError(409)).toBe(true);
    expect(keepKeyAfterError(502)).toBe(true);
    expect(keepKeyAfterError(422)).toBe(false);
  });
});
