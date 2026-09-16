import { describe, expect, it } from "vitest";
import { formatCurrency } from "./currency";

describe("formatCurrency", () => {
  it("groups thousands with a space and appends the ruble suffix", () => {
    expect(formatCurrency(12_345_678)).toBe("12 345 678 руб.");
  });

  it("rounds fractional amounts", () => {
    expect(formatCurrency(999.6)).toBe("1 000 руб.");
  });

  it("handles small amounts without grouping", () => {
    expect(formatCurrency(500)).toBe("500 руб.");
  });
});
