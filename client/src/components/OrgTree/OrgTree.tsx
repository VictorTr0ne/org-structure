import type { ReactElement } from "react";
import type { TreeNode, ValuesById } from "@/lib/tree/types";
import { OrgTreeNode } from "./OrgTreeNode";
import { TreeRoot } from "./styles";

export interface OrgTreeProps {
  roots: TreeNode[];
  valuesById: ValuesById;
  expandedIds: Set<string>;
  selectedId: string | null;
  onToggleExpand: (id: string) => void;
  onSelectNode: (id: string) => void;
}

export function OrgTree({
  roots,
  valuesById,
  expandedIds,
  selectedId,
  onToggleExpand,
  onSelectNode,
}: OrgTreeProps): ReactElement {
  return (
    <TreeRoot role="tree" aria-label="Орг-структура">
      {roots.map((root) => (
        <OrgTreeNode
          key={root.id}
          node={root}
          valuesById={valuesById}
          expandedIds={expandedIds}
          selectedId={selectedId}
          onToggleExpand={onToggleExpand}
          onSelectNode={onSelectNode}
        />
      ))}
    </TreeRoot>
  );
}
