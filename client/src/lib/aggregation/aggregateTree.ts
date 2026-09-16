import type { TreeNode, ValuesById } from "@/lib/tree/types";
import type { SubtreeAggregate } from "./types";

function computeSubtree(
  node: TreeNode,
  valuesById: ValuesById,
  out: Map<string, SubtreeAggregate>,
): SubtreeAggregate {
  const own = valuesById.get(node.id) ?? node;

  let totalHeadcount = own.headcount;
  let totalBudget = own.budget;
  let performanceWeightSum = own.performance * own.headcount;

  for (const child of node.children) {
    const childAggregate = computeSubtree(child, valuesById, out);
    totalHeadcount += childAggregate.totalHeadcount;
    totalBudget += childAggregate.totalBudget;
    performanceWeightSum += childAggregate.performanceWeightSum;
  }

  const aggregate: SubtreeAggregate = { totalHeadcount, totalBudget, performanceWeightSum };
  out.set(node.id, aggregate);
  return aggregate;
}

/**
 * Full bottom-up pass: for every node, sums headcount/budget across the node and all of its
 * descendants, and accumulates a headcount-weighted performance sum. Meant to run once after
 * the tree loads (or a background revalidate replaces it) and be memoized by the caller —
 * incremental updates from live patches go through `applyPatchToAggregates` instead.
 */
export function aggregateTree(roots: TreeNode[], valuesById: ValuesById): Map<string, SubtreeAggregate> {
  const out = new Map<string, SubtreeAggregate>();
  roots.forEach((root) => computeSubtree(root, valuesById, out));
  return out;
}
