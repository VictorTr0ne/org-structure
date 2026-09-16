export type PerformanceLevel = "high" | "medium" | "low";

/** Thresholds behind the tree/table's performance color indicator: green >=80, yellow 50-79, red <50. */
export function getPerformanceLevel(performance: number): PerformanceLevel {
  if (performance >= 80) return "high";
  if (performance >= 50) return "medium";
  return "low";
}
