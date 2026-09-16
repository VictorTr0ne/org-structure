const LEVEL_LABELS = ["Дивизион", "Отдел", "Команда"] as const;

/** Human-readable label for the table's "Уровень" column; falls back to a numeric label past depth 3. */
export function getLevelLabel(depth: number): string {
  return LEVEL_LABELS[depth - 1] ?? `Уровень ${depth}`;
}
