import { useEffect, useRef, type ReactElement } from "react";
import type { TreeNode, ValuesById } from "@/lib/tree/types";
import { getPerformanceLevel } from "@/lib/format/performanceLevel";
import {
  ChildrenWrapper,
  ExpandButton,
  Headcount,
  NodeName,
  NodeRow,
  PerformanceDot,
  TreeItem,
  TreeRoot,
} from "./styles";

export interface OrgTreeNodeProps {
  node: TreeNode;
  valuesById: ValuesById;
  expandedIds: Set<string>;
  selectedId: string | null;
  onToggleExpand: (id: string) => void;
  onSelectNode: (id: string) => void;
}

export function OrgTreeNode({
  node,
  valuesById,
  expandedIds,
  selectedId,
  onToggleExpand,
  onSelectNode,
}: OrgTreeNodeProps): ReactElement {
  const values = valuesById.get(node.id) ?? node;
  const hasChildren = node.children.length > 0;
  const expanded = expandedIds.has(node.id);
  const selected = selectedId === node.id;
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) {
      rowRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [selected]);

  return (
    <TreeItem>
      <NodeRow
        ref={rowRef}
        $depth={node.depth}
        $selected={selected}
        onClick={() => onSelectNode(node.id)}
        role="treeitem"
        aria-expanded={hasChildren ? expanded : undefined}
        aria-selected={selected}
      >
        <ExpandButton
          type="button"
          $expanded={expanded}
          $visible={hasChildren}
          aria-label={expanded ? "Свернуть" : "Развернуть"}
          onClick={(event) => {
            event.stopPropagation();
            if (hasChildren) onToggleExpand(node.id);
          }}
        >
          ▶
        </ExpandButton>
        <PerformanceDot $level={getPerformanceLevel(values.performance)} title={`Эффективность: ${values.performance}`} />
        <NodeName>{node.name}</NodeName>
        <Headcount>{values.headcount} чел.</Headcount>
      </NodeRow>
      {hasChildren && (
        <ChildrenWrapper $expanded={expanded}>
          <TreeRoot role="group">
            {node.children.map((child) => (
              <OrgTreeNode
                key={child.id}
                node={child}
                valuesById={valuesById}
                expandedIds={expandedIds}
                selectedId={selectedId}
                onToggleExpand={onToggleExpand}
                onSelectNode={onSelectNode}
              />
            ))}
          </TreeRoot>
        </ChildrenWrapper>
      )}
    </TreeItem>
  );
}
