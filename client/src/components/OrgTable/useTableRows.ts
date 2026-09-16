import { useMemo } from "react";
import { flattenTree } from "@/lib/tree/flatten";
import type { TreeNode, ValuesById } from "@/lib/tree/types";
import { weightedPerformance, type SubtreeAggregate } from "@/lib/aggregation/types";
import { useDebouncedValue } from "@/lib/format/useDebouncedValue";
import type { SortColumn, SortState, TableRow } from "./types";

function buildRows(
  roots: TreeNode[],
  valuesById: ValuesById,
  aggregates: Map<string, SubtreeAggregate>,
): TableRow[] {
  return flattenTree(roots).map((node) => {
    const values = valuesById.get(node.id) ?? node;
    const aggregate = aggregates.get(node.id);
    return {
      id: node.id,
      name: node.name,
      depth: node.depth,
      parentId: node.parentId,
      totalHeadcount: aggregate?.totalHeadcount ?? values.headcount,
      totalBudget: aggregate?.totalBudget ?? values.budget,
      weightedPerformance: aggregate
        ? weightedPerformance(aggregate, values.performance)
        : values.performance,
      updatedAt: values.updatedAt,
    };
  });
}

function matchesPlainText(row: TableRow, needle: string): boolean {
  return row.name.toLowerCase().includes(needle);
}

function compareRows(a: TableRow, b: TableRow, column: SortColumn): number {
  switch (column) {
    case "name":
      return a.name.localeCompare(b.name, "ru");
    case "level":
      return a.depth - b.depth;
    case "totalHeadcount":
      return a.totalHeadcount - b.totalHeadcount;
    case "totalBudget":
      return a.totalBudget - b.totalBudget;
    case "weightedPerformance":
      return a.weightedPerformance - b.weightedPerformance;
  }
}

export interface UseTableRowsResult {
  rows: TableRow[];
}

export function useTableRows(
  roots: TreeNode[],
  valuesById: ValuesById,
  aggregates: Map<string, SubtreeAggregate>,
  searchQuery: string,
  sort: SortState,
): UseTableRowsResult {
  const debouncedQuery = useDebouncedValue(searchQuery, 250);

  const allRows = useMemo(() => buildRows(roots, valuesById, aggregates), [roots, valuesById, aggregates]);

  const filteredRows = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    if (!needle) return allRows;
    return allRows.filter((row) => matchesPlainText(row, needle));
  }, [allRows, debouncedQuery]);

  const sortedRows = useMemo(() => {
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...filteredRows].sort((a, b) => factor * compareRows(a, b, sort.column));
  }, [filteredRows, sort]);

  return { rows: sortedRows };
}
