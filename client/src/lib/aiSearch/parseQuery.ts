export interface NumericFilter {
  op: "gt" | "gte" | "lt" | "lte";
  value: number;
}

export interface StructuredFilter {
  level?: number;
  headcount?: NumericFilter;
  budget?: NumericFilter;
  performance?: NumericFilter;
}

interface MetricSpec {
  field: "headcount" | "budget" | "performance";
  stems: string[];
}

const METRIC_SPECS: MetricSpec[] = [
  { field: "headcount", stems: ["сотрудник", "численност", "headcount"] },
  { field: "budget", stems: ["бюджет", "budget"] },
  { field: "performance", stems: ["эффективност", "performance"] },
];

const LEVEL_STEMS: Array<{ stem: string; level: number }> = [
  { stem: "дивизион", level: 1 },
  { stem: "отдел", level: 2 },
  { stem: "команд", level: 3 },
];

const COMPARATOR_SPECS: Array<{ phrases: string[]; op: NumericFilter["op"] }> = [
  { phrases: ["не менее", "от "], op: "gte" },
  { phrases: ["не более", "до "], op: "lte" },
  { phrases: ["больше", "выше", "свыше", ">"], op: "gt" },
  { phrases: ["меньше", "ниже", "<"], op: "lt" },
];

const NUMBER_WITH_SUFFIX = /(\d+(?:[.,]\d+)?)\s*(млн|тыс)?/iu;

function containsStem(text: string, stem: string): boolean {
  return new RegExp(`${stem}[а-яёa-z]*`, "iu").test(text);
}

function findComparatorOp(text: string): NumericFilter["op"] | null {
  for (const spec of COMPARATOR_SPECS) {
    if (spec.phrases.some((phrase) => text.includes(phrase))) return spec.op;
  }
  return null;
}

function extractNumber(text: string): number | null {
  const match = NUMBER_WITH_SUFFIX.exec(text);
  if (!match) return null;
  const raw = match[1];
  const suffix = match[2]?.toLowerCase();
  if (!raw) return null;
  let value = parseFloat(raw.replace(",", "."));
  if (suffix === "млн") value *= 1_000_000;
  if (suffix === "тыс") value *= 1_000;
  return value;
}

/**
 * Heuristic (non-LLM) natural-language -> structured-filter parser for the table's AI search box.
 * Recognizes level words (дивизион/отдел/команда) and metric comparisons — headcount/budget/
 * performance combined with больше/меньше/от/до + a number, optionally suffixed млн/тыс.
 * Returns null when it recognizes nothing, so the caller can fall back to plain substring search
 * instead of silently showing an empty (or unfiltered) table for an unparseable query.
 */
export function parseNaturalLanguageQuery(rawQuery: string): StructuredFilter | null {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return null;

  const filter: StructuredFilter = {};
  let matched = false;

  for (const { stem, level } of LEVEL_STEMS) {
    if (containsStem(query, stem)) {
      filter.level = level;
      matched = true;
      break;
    }
  }

  for (const spec of METRIC_SPECS) {
    if (spec.stems.some((stem) => containsStem(query, stem))) {
      const op = findComparatorOp(query);
      const value = extractNumber(query);
      if (op && value !== null) {
        filter[spec.field] = { op, value };
        matched = true;
      }
      break;
    }
  }

  return matched ? filter : null;
}

function matchesNumericFilter(actual: number, filter: NumericFilter): boolean {
  switch (filter.op) {
    case "gt":
      return actual > filter.value;
    case "gte":
      return actual >= filter.value;
    case "lt":
      return actual < filter.value;
    case "lte":
      return actual <= filter.value;
  }
}

export interface FilterableRow {
  depth: number;
  headcount: number;
  budget: number;
  performance: number;
}

export function matchesStructuredFilter(row: FilterableRow, filter: StructuredFilter): boolean {
  if (filter.level !== undefined && row.depth !== filter.level) return false;
  if (filter.headcount && !matchesNumericFilter(row.headcount, filter.headcount)) return false;
  if (filter.budget && !matchesNumericFilter(row.budget, filter.budget)) return false;
  if (filter.performance && !matchesNumericFilter(row.performance, filter.performance)) return false;
  return true;
}
