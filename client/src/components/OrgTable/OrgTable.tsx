import { useEffect, useRef, useState, type KeyboardEvent, type ReactElement } from "react";
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
  fadingFields: Map<string, Set<string>>;
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
  fadingFields,
  selectedId,
  onSelectNode,
}: OrgTableProps): ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ column: "name", direction: "asc" });
  const [focusedIndex, setFocusedIndex] = useState(0);
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);

  const { rows } = useTableRows(roots, valuesById, aggregates, searchQuery, sort);

  useEffect(() => {
    setFocusedIndex((index) => Math.min(index, Math.max(0, rows.length - 1)));
  }, [rows.length]);

  useEffect(() => {
    rowRefs.current[focusedIndex]?.focus();
  }, [focusedIndex]);

  const handleHeaderClick = (column: SortColumn) => setSort({ column, direction: "asc" });
  const handleHeaderDoubleClick = (column: SortColumn) =>
    setSort((previous) =>
      previous.column === column
        ? { column, direction: previous.direction === "asc" ? "desc" : "asc" }
        : { column, direction: "desc" },
    );

  const handleKeyDown = (event: KeyboardEvent<HTMLTableSectionElement>) => {
    if (rows.length === 0) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setFocusedIndex((index) => Math.min(rows.length - 1, index + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setFocusedIndex((index) => Math.max(0, index - 1));
        break;
      case "Home":
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case "End":
        event.preventDefault();
        setFocusedIndex(rows.length - 1);
        break;
      case "Enter": {
        const row = rows[focusedIndex];
        if (row) onSelectNode(row.id);
        break;
      }
      default:
        break;
    }
  };

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
          <tbody onKeyDown={handleKeyDown}>
            {rows.length === 0 && (
              <EmptyRow>
                <td colSpan={COLUMNS.length}>Ничего не найдено</td>
              </EmptyRow>
            )}
            {rows.map((row, index) => {
              const fading = fadingFields.get(row.id);
              return (
                <BodyRow
                  key={row.id}
                  ref={(element) => {
                    rowRefs.current[index] = element;
                  }}
                  $selected={row.id === selectedId}
                  tabIndex={index === focusedIndex ? 0 : -1}
                  onClick={() => onSelectNode(row.id)}
                  onFocus={() => setFocusedIndex(index)}
                >
                  <BodyCell $indent={row.depth}>{row.name}</BodyCell>
                  <BodyCell>{getLevelLabel(row.depth)}</BodyCell>
                  <BodyCell $fading={fading?.has("headcount")}>{row.totalHeadcount}</BodyCell>
                  <BodyCell $fading={fading?.has("budget")}>{formatCurrency(row.totalBudget)}</BodyCell>
                  <BodyCell $fading={fading?.has("performance")}>
                    <PerformanceBadge $level={getPerformanceLevel(row.weightedPerformance)}>
                      {row.weightedPerformance.toFixed(1)}
                    </PerformanceBadge>
                  </BodyCell>
                </BodyRow>
              );
            })}
          </tbody>
        </StyledTable>
      </TableScrollArea>
    </div>
  );
}
