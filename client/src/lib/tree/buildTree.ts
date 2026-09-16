import type { OrgNode } from "@/lib/schema/orgNode";
import type { OrgTreeIndex, TreeNode } from "./types";

/** Builds a parent -> children tree from the flat API response. Depth is 1 for root nodes. */
export function buildTree(nodes: OrgNode[]): OrgTreeIndex {
  const byId = new Map<string, TreeNode>(
    nodes.map((node) => [node.id, { ...node, depth: 0, children: [] }]),
  );

  const roots: TreeNode[] = [];

  byId.forEach((node) => {
    if (node.parentId === null) {
      roots.push(node);
      return;
    }
    const parent = byId.get(node.parentId);
    if (parent) {
      parent.children.push(node);
    } else {
      // Data integrity issue on the server: treat as a root rather than dropping the node.
      roots.push(node);
    }
  });

  const assignDepth = (node: TreeNode, depth: number) => {
    node.depth = depth;
    node.children.forEach((child) => assignDepth(child, depth + 1));
  };
  roots.forEach((root) => assignDepth(root, 1));

  return { roots, byId };
}

/** Ids of every ancestor of `nodeId`, from immediate parent up to the root. */
export function getAncestorIds(byId: Map<string, TreeNode>, nodeId: string): string[] {
  const ancestors: string[] = [];
  let current = byId.get(nodeId);
  while (current?.parentId) {
    ancestors.push(current.parentId);
    current = byId.get(current.parentId);
  }
  return ancestors;
}
