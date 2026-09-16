import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import { useOrgTreeQuery } from "@/lib/query/useOrgTreeQuery";
import { buildTree, getAncestorIds } from "@/lib/tree/buildTree";
import { collectInitialValues, type OrgTreeIndex, type ValuesById } from "@/lib/tree/types";
import { aggregateTree } from "@/lib/aggregation/aggregateTree";
import type { SubtreeAggregate } from "@/lib/aggregation/types";
import { OrgTreeValidationError } from "@/lib/schema/orgNode";
import { EmptyState, ErrorState, LoadingState } from "@/components/StatusView/StatusView";
import { ViewSwitcher, type DashboardView } from "@/components/ViewSwitcher/ViewSwitcher";
import { OrgTree } from "@/components/OrgTree/OrgTree";
import { OrgTable } from "@/components/OrgTable/OrgTable";
import { Content, Layout, Page, Pane, PaneTitle, Toolbar } from "./styles";

function errorMessage(error: unknown): string {
  if (error instanceof OrgTreeValidationError) {
    return "Ответ сервера не прошёл валидацию схемы. Проверьте, что API возвращает корректный список узлов.";
  }
  if (error instanceof Error) return error.message;
  return "Неизвестная ошибка сети.";
}

export function Dashboard(): ReactElement {
  const query = useOrgTreeQuery();

  const treeRef = useRef<OrgTreeIndex | null>(null);
  const [values, setValues] = useState<ValuesById | null>(null);
  const [aggregates, setAggregates] = useState<Map<string, SubtreeAggregate> | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<DashboardView>("tree");

  // Hydrate the static tree shape + initial values/aggregates exactly once, on first successful load.
  useEffect(() => {
    if (query.data && !treeRef.current) {
      const tree = buildTree(query.data);
      treeRef.current = tree;
      const initialValues = collectInitialValues(query.data);
      setValues(initialValues);
      setAggregates(aggregateTree(tree.roots, initialValues));
      setExpandedIds(new Set(tree.roots.map((root) => root.id)));
    }
  }, [query.data]);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectNode = useCallback((id: string) => {
    setSelectedId(id);
    const tree = treeRef.current;
    if (!tree) return;
    const ancestors = getAncestorIds(tree.byId, id);
    if (ancestors.length === 0) return;
    setExpandedIds((previous) => {
      const next = new Set(previous);
      ancestors.forEach((ancestorId) => next.add(ancestorId));
      return next;
    });
  }, []);

  const isFirstLoad = !values;

  if (isFirstLoad && query.status === "loading") {
    return (
      <Page>
        <Content>
          <LoadingState />
        </Content>
      </Page>
    );
  }

  if (isFirstLoad && query.status === "error") {
    return (
      <Page>
        <Content>
          <ErrorState message={errorMessage(query.error)} onRetry={query.refetch} />
        </Content>
      </Page>
    );
  }

  if (!values || !aggregates || !treeRef.current) {
    return (
      <Page>
        <Content>
          <LoadingState />
        </Content>
      </Page>
    );
  }

  if (treeRef.current.roots.length === 0) {
    return (
      <Page>
        <Content>
          <EmptyState />
        </Content>
      </Page>
    );
  }

  return (
    <Page>
      <Content>
        <Toolbar>
          <ViewSwitcher view={view} onChange={setView} />
        </Toolbar>
        <Layout $view={view}>
          <Pane className="pane-tree">
            <PaneTitle>Дерево</PaneTitle>
            <OrgTree
              roots={treeRef.current.roots}
              valuesById={values}
              expandedIds={expandedIds}
              selectedId={selectedId}
              onToggleExpand={handleToggleExpand}
              onSelectNode={handleSelectNode}
            />
          </Pane>
          <Pane className="pane-table">
            <PaneTitle>Таблица</PaneTitle>
            <OrgTable
              roots={treeRef.current.roots}
              valuesById={values}
              aggregates={aggregates}
              selectedId={selectedId}
              onSelectNode={handleSelectNode}
            />
          </Pane>
        </Layout>
      </Content>
    </Page>
  );
}
