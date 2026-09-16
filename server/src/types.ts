export interface OrgNode {
  id: string;
  name: string;
  parentId: string | null;
  headcount: number;
  budget: number;
  performance: number;
  updatedAt: string;
}

export type OrgNodePatchableField = "headcount" | "budget" | "performance";

export interface OrgNodePatch {
  type: "update";
  nodeId: string;
  changes: Partial<Record<OrgNodePatchableField, number>> & { updatedAt: string };
}
