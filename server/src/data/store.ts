import { generateOrgTree } from "./generateOrgTree.js";
import type { OrgNode } from "../types.js";

const nodes: Map<string, OrgNode> = new Map(
  generateOrgTree().map((node) => [node.id, node]),
);

export function getAllNodes(): OrgNode[] {
  return Array.from(nodes.values());
}

export function getLeafNodeIds(): string[] {
  const parentIds = new Set(
    Array.from(nodes.values())
      .map((node) => node.parentId)
      .filter((id): id is string => id !== null),
  );
  return Array.from(nodes.keys()).filter((id) => !parentIds.has(id));
}

export function getNode(id: string): OrgNode | undefined {
  return nodes.get(id);
}

export function applyMutation(
  id: string,
  changes: Partial<Pick<OrgNode, "headcount" | "budget" | "performance">>,
): OrgNode | undefined {
  const existing = nodes.get(id);
  if (!existing) return undefined;
  const updated: OrgNode = {
    ...existing,
    ...changes,
    updatedAt: new Date().toISOString(),
  };
  nodes.set(id, updated);
  return updated;
}
