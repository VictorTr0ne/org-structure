import { useState, type ReactElement } from "react";
import type { TreeNode, ValuesById } from "@/lib/tree/types";
import type { SubtreeAggregate } from "@/lib/aggregation/types";
import { getPerformanceLevel } from "@/lib/format/performanceLevel";
import { formatCurrency } from "@/lib/format/currency";
import { getLevelLabel } from "@/lib/tree/levelLabel";
import { useTableRows } from "./useTableRows";
import type { SortColumn, SortState } from "./types";
import {
  BodyCell,
  BodyRow,
  EmptyRow,
  HeaderCell,
  PerformanceBadge,
  SearchInput,
  StyledTable,
  TableScrollArea,
  TableToolbar,
} from "./styles";

export interface OrgTableProps {
  roots: TreeNode[];
  valuesById: ValuesById;
  aggregates: Map<string, SubtreeAggregate>;
  selectedId: string | null;
  onSelectNode: (id: string) => void;
}

const COLUMNS: Array<{ key: SortColumn; label: string }> = [
  { key: "name", label: "Подразделение" },
  { key: "level", label: "Уровень" },
  { key: "totalHeadcount", label: "Всего сотрудников" },
  { key: "totalBudget", label: "Бюджет суммарный" },
  { key: "weightedPerformance", label: "Средняя эффективность" },
];

export function OrgTable({
  roots,
  valuesById,
  aggregates,
  selectedId,
  onSelectNode,
}: OrgTableProps): ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ column: "name", direction: "asc" });

  const { rows } = useTableRows(roots, valuesById, aggregates, searchQuery, sort);

  const handleHeaderClick = (column: SortColumn) => setSort({ column, direction: "asc" });
  const handleHeaderDoubleClick = (column: SortColumn) =>
    setSort((previous) =>
      previous.column === column
        ? { column, direction: previous.direction === "asc" ? "desc" : "asc" }
        : { column, direction: "desc" },
    );

  return (
    <div>
      <TableToolbar>
        <SearchInput
          type="search"
          placeholder="Поиск по названию…"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          aria-label="Поиск по таблице"
        />
      </TableToolbar>
      <TableScrollArea>
        <StyledTable>
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <HeaderCell
                  key={column.key}
                  onClick={() => handleHeaderClick(column.key)}
                  onDoubleClick={() => handleHeaderDoubleClick(column.key)}
                  aria-sort={
                    sort.column === column.key ? (sort.direction === "asc" ? "ascending" : "descending") : "none"
                  }
                >
                  {column.label}
                  {sort.column === column.key ? (sort.direction === "asc" ? " ▲" : " ▼") : ""}
                </HeaderCell>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <EmptyRow>
                <td colSpan={COLUMNS.length}>Ничего не найдено</td>
              </EmptyRow>
            )}
            {rows.map((row) => (
              <BodyRow key={row.id} $selected={row.id === selectedId} onClick={() => onSelectNode(row.id)}>
                <BodyCell $indent={row.depth}>{row.name}</BodyCell>
                <BodyCell>{getLevelLabel(row.depth)}</BodyCell>
                <BodyCell>{row.totalHeadcount}</BodyCell>
                <BodyCell>{formatCurrency(row.totalBudget)}</BodyCell>
                <BodyCell>
                  <PerformanceBadge $level={getPerformanceLevel(row.weightedPerformance)}>
                    {row.weightedPerformance.toFixed(1)}
                  </PerformanceBadge>
                </BodyCell>
              </BodyRow>
            ))}
          </tbody>
        </StyledTable>
      </TableScrollArea>
    </div>
  );
}
