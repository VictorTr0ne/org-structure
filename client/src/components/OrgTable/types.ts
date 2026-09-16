export interface TableRow {
  id: string;
  name: string;
  depth: number;
  parentId: string | null;
  totalHeadcount: number;
  totalBudget: number;
  weightedPerformance: number;
  updatedAt: string;
}

export type SortColumn = "name" | "level" | "totalHeadcount" | "totalBudget" | "weightedPerformance";

export interface SortState {
  column: SortColumn;
  direction: "asc" | "desc";
}
