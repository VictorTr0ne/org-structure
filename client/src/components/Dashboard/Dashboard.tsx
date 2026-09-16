import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import { useOrgTreeQuery } from "@/lib/query/useOrgTreeQuery";
import { buildTree } from "@/lib/tree/buildTree";
import { collectInitialValues, type OrgTreeIndex, type ValuesById } from "@/lib/tree/types";
import { OrgTreeValidationError } from "@/lib/schema/orgNode";
import { EmptyState, ErrorState, LoadingState } from "@/components/StatusView/StatusView";
import { OrgTree } from "@/components/OrgTree/OrgTree";
import { Content, Page, Pane, PaneTitle } from "./styles";

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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Hydrate the static tree shape + initial values exactly once, on first successful load.
  useEffect(() => {
    if (query.data && !treeRef.current) {
      const tree = buildTree(query.data);
      treeRef.current = tree;
      setValues(collectInitialValues(query.data));
      // Second level (divisions' children) open by default => expand every root.
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

  if (!values && query.status === "loading") {
    return (
      <Page>
        <Content>
          <LoadingState />
        </Content>
      </Page>
    );
  }

  if (!values && query.status === "error") {
    return (
      <Page>
        <Content>
          <ErrorState message={errorMessage(query.error)} onRetry={query.refetch} />
        </Content>
      </Page>
    );
  }

  if (!values || !treeRef.current) {
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
        <Pane>
          <PaneTitle>Дерево</PaneTitle>
          <OrgTree
            roots={treeRef.current.roots}
            valuesById={values}
            expandedIds={expandedIds}
            selectedId={null}
            onToggleExpand={handleToggleExpand}
            onSelectNode={() => {}}
          />
        </Pane>
      </Content>
    </Page>
  );
}
