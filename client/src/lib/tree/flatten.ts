import type { TreeNode } from "./types";

/** Depth-first flattening of the tree, used as the table's row source (independent of tree expand state). */
export function flattenTree(roots: TreeNode[]): TreeNode[] {
  const rows: TreeNode[] = [];
  const visit = (node: TreeNode) => {
    rows.push(node);
    node.children.forEach(visit);
  };
  roots.forEach(visit);
  return rows;
}
