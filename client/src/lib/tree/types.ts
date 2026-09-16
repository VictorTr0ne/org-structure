import type { OrgNode } from "@/lib/schema/orgNode";

export interface TreeNode extends OrgNode {
  depth: number;
  children: TreeNode[];
}

export interface OrgTreeIndex {
  roots: TreeNode[];
  byId: Map<string, TreeNode>;
}

export type NodeValues = Pick<OrgNode, "headcount" | "budget" | "performance" | "updatedAt">;

export type ValuesById = Map<string, NodeValues>;

export function collectInitialValues(nodes: OrgNode[]): ValuesById {
  return new Map(
    nodes.map((node) => [
      node.id,
      { headcount: node.headcount, budget: node.budget, performance: node.performance, updatedAt: node.updatedAt },
    ]),
  );
}
