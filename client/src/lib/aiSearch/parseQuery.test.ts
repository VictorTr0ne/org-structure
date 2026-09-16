import { describe, expect, it } from "vitest";
import { matchesStructuredFilter, parseNaturalLanguageQuery } from "./parseQuery";

describe("parseNaturalLanguageQuery", () => {
  it("parses a level + budget comparison in millions", () => {
    expect(parseNaturalLanguageQuery("команды с бюджетом больше 5 млн")).toEqual({
      level: 3,
      budget: { op: "gt", value: 5_000_000 },
    });
  });

  it("parses 'не более' as lte and headcount stems", () => {
    expect(parseNaturalLanguageQuery("отделы с численностью не более 10")).toEqual({
      level: 2,
      headcount: { op: "lte", value: 10 },
    });
  });

  it("parses performance comparisons", () => {
    expect(parseNaturalLanguageQuery("дивизионы с эффективностью меньше 60")).toEqual({
      level: 1,
      performance: { op: "lt", value: 60 },
    });
  });

  it("returns null for a query it can't confidently parse, so the caller can fall back", () => {
    expect(parseNaturalLanguageQuery("маркетинг")).toBeNull();
    expect(parseNaturalLanguageQuery("")).toBeNull();
  });
});

describe("matchesStructuredFilter", () => {
  const row = { depth: 3, headcount: 12, budget: 6_000_000, performance: 55 };

  it("matches when every present constraint holds", () => {
    expect(
      matchesStructuredFilter(row, { level: 3, budget: { op: "gt", value: 5_000_000 } }),
    ).toBe(true);
  });

  it("rejects when any constraint fails", () => {
    expect(
      matchesStructuredFilter(row, { level: 3, performance: { op: "gt", value: 80 } }),
    ).toBe(false);
    expect(matchesStructuredFilter(row, { level: 1 })).toBe(false);
  });
});
