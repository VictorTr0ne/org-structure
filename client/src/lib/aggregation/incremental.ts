import { getAncestorIds } from "@/lib/tree/buildTree";
import type { NodeValues, OrgTreeIndex } from "@/lib/tree/types";
import type { SubtreeAggregate } from "./types";

/**
 * Applies one node's before/after values to the aggregate map by delta, touching only that
 * node and its ancestor chain — never the full tree — matching the "recompute aggregates only
 * for the affected node and its ancestors" requirement for live patches.
 */
export function applyPatchToAggregates(
  tree: OrgTreeIndex,
  aggregates: Map<string, SubtreeAggregate>,
  nodeId: string,
  previous: NodeValues,
  next: NodeValues,
): Map<string, SubtreeAggregate> {
  const headcountDelta = next.headcount - previous.headcount;
  const budgetDelta = next.budget - previous.budget;
  const performanceWeightDelta =
    next.performance * next.headcount - previous.performance * previous.headcount;

  if (headcountDelta === 0 && budgetDelta === 0 && performanceWeightDelta === 0) {
    return aggregates;
  }

  const updated = new Map(aggregates);
  const affectedChain = [nodeId, ...getAncestorIds(tree.byId, nodeId)];

  for (const id of affectedChain) {
    const current = updated.get(id);
    if (!current) continue;
    updated.set(id, {
      totalHeadcount: current.totalHeadcount + headcountDelta,
      totalBudget: current.totalBudget + budgetDelta,
      performanceWeightSum: current.performanceWeightSum + performanceWeightDelta,
    });
  }

  return updated;
}
