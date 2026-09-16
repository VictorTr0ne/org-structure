import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import { useOrgTreeQuery } from "@/lib/query/useOrgTreeQuery";
import { useOrgTreeSocket } from "@/lib/realtime/useOrgTreeSocket";
import { buildTree, getAncestorIds } from "@/lib/tree/buildTree";
import { collectInitialValues, type NodeValues, type OrgTreeIndex, type ValuesById } from "@/lib/tree/types";
import { aggregateTree } from "@/lib/aggregation/aggregateTree";
import { applyPatchToAggregates } from "@/lib/aggregation/incremental";
import type { SubtreeAggregate } from "@/lib/aggregation/types";
import type { OrgNodePatch } from "@/lib/schema/orgNodePatch";
import { OrgTreeValidationError } from "@/lib/schema/orgNode";
import { EmptyState, ErrorState, LoadingState } from "@/components/StatusView/StatusView";
import { Header } from "@/components/Header/Header";
import { ViewSwitcher, type DashboardView } from "@/components/ViewSwitcher/ViewSwitcher";
import { OrgTree } from "@/components/OrgTree/OrgTree";
import { OrgTable } from "@/components/OrgTable/OrgTable";
import { Content, Layout, Page, Pane, PaneTitle, Toolbar } from "./styles";

const FADE_DURATION_MS = 1_500;

type MetricField = "headcount" | "budget" | "performance";

function changedFields(changes: OrgNodePatch["changes"]): MetricField[] {
  return (["headcount", "budget", "performance"] as const).filter((field) => changes[field] !== undefined);
}

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
  const valuesRef = useRef<ValuesById | null>(null);

  const [values, setValues] = useState<ValuesById | null>(null);
  const [aggregates, setAggregates] = useState<Map<string, SubtreeAggregate> | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<DashboardView>("tree");
  const [fadingFields, setFadingFields] = useState<Map<string, Set<MetricField>>>(new Map());
  const fadeTimeouts = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  // Hydrate the static tree shape + initial values/aggregates exactly once, on first successful load.
  // Later WS patches update `values`/`aggregates` in place; a background revalidate of the base
  // query is not treated as a new snapshot (see docs/adr/002-realtime-transport.md).
  useEffect(() => {
    if (query.data && !treeRef.current) {
      const tree = buildTree(query.data);
      treeRef.current = tree;
      const initialValues = collectInitialValues(query.data);
      valuesRef.current = initialValues;
      setValues(initialValues);
      setAggregates(aggregateTree(tree.roots, initialValues));
      setExpandedIds(new Set(tree.roots.map((root) => root.id)));
    }
  }, [query.data]);

  const triggerFade = useCallback((nodeId: string, fields: MetricField[]) => {
    if (fields.length === 0) return;
    setFadingFields((previous) => {
      const next = new Map(previous);
      const set = new Set(next.get(nodeId));
      fields.forEach((field) => set.add(field));
      next.set(nodeId, set);
      return next;
    });

    const existingTimeout = fadeTimeouts.current.get(nodeId);
    if (existingTimeout) clearTimeout(existingTimeout);
    const timeout = setTimeout(() => {
      setFadingFields((previous) => {
        const next = new Map(previous);
        next.delete(nodeId);
        return next;
      });
      fadeTimeouts.current.delete(nodeId);
    }, FADE_DURATION_MS);
    fadeTimeouts.current.set(nodeId, timeout);
  }, []);

  useEffect(() => {
    const timeouts = fadeTimeouts.current;
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const handlePatch = useCallback(
    (patch: OrgNodePatch) => {
      const tree = treeRef.current;
      const currentValues = valuesRef.current;
      if (!tree || !currentValues) return;
      const previous = currentValues.get(patch.nodeId);
      if (!previous) return;

      const next: NodeValues = { ...previous, ...patch.changes };
      const updatedValues = new Map(currentValues);
      updatedValues.set(patch.nodeId, next);
      valuesRef.current = updatedValues;
      setValues(updatedValues);

      setAggregates((previousAggregates) =>
        previousAggregates
          ? applyPatchToAggregates(tree, previousAggregates, patch.nodeId, previous, next)
          : previousAggregates,
      );

      triggerFade(patch.nodeId, changedFields(patch.changes));
    },
    [triggerFade],
  );

  const connectionStatus = useOrgTreeSocket({ onPatch: handlePatch });

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
        <Header connectionStatus={connectionStatus} />
        <Content>
          <LoadingState />
        </Content>
      </Page>
    );
  }

  if (isFirstLoad && query.status === "error") {
    return (
      <Page>
        <Header connectionStatus={connectionStatus} />
        <Content>
          <ErrorState message={errorMessage(query.error)} onRetry={query.refetch} />
        </Content>
      </Page>
    );
  }

  if (!values || !aggregates || !treeRef.current) {
    return (
      <Page>
        <Header connectionStatus={connectionStatus} />
        <Content>
          <LoadingState />
        </Content>
      </Page>
    );
  }

  if (treeRef.current.roots.length === 0) {
    return (
      <Page>
        <Header connectionStatus={connectionStatus} />
        <Content>
          <EmptyState />
        </Content>
      </Page>
    );
  }

  return (
    <Page>
      <Header connectionStatus={connectionStatus} />
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
              fadingFields={fadingFields}
              selectedId={selectedId}
              onSelectNode={handleSelectNode}
            />
          </Pane>
        </Layout>
      </Content>
    </Page>
  );
}
