import { describe, expect, it } from "vitest";
import { buildTree } from "@/lib/tree/buildTree";
import { collectInitialValues } from "@/lib/tree/types";
import type { OrgNode } from "@/lib/schema/orgNode";
import { aggregateTree } from "./aggregateTree";
import { applyPatchToAggregates } from "./incremental";
import { weightedPerformance } from "./types";

const now = "2026-01-01T00:00:00.000Z";

function node(overrides: Partial<OrgNode> & Pick<OrgNode, "id" | "parentId">): OrgNode {
  return {
    name: overrides.id,
    headcount: 0,
    budget: 0,
    performance: 0,
    updatedAt: now,
    ...overrides,
  };
}

// division -> department -> two teams
const sampleNodes: OrgNode[] = [
  node({ id: "div", parentId: null, headcount: 2, budget: 1_000, performance: 80 }),
  node({ id: "dept", parentId: "div", headcount: 1, budget: 500, performance: 60 }),
  node({ id: "team-a", parentId: "dept", headcount: 10, budget: 2_000, performance: 90 }),
  node({ id: "team-b", parentId: "dept", headcount: 5, budget: 1_000, performance: 60 }),
];

describe("aggregateTree", () => {
  it("sums headcount and budget across the whole subtree, including the node itself", () => {
    const tree = buildTree(sampleNodes);
    const values = collectInitialValues(sampleNodes);
    const aggregates = aggregateTree(tree.roots, values);

    // team-a is a leaf: its subtree is just itself.
    expect(aggregates.get("team-a")).toEqual({
      totalHeadcount: 10,
      totalBudget: 2_000,
      performanceWeightSum: 900,
    });

    // dept = itself (1, 500) + team-a (10, 2000) + team-b (5, 1000)
    expect(aggregates.get("dept")?.totalHeadcount).toBe(16);
    expect(aggregates.get("dept")?.totalBudget).toBe(3_500);

    // div = itself (2, 1000) + the whole dept subtree
    expect(aggregates.get("div")?.totalHeadcount).toBe(18);
    expect(aggregates.get("div")?.totalBudget).toBe(4_500);
  });

  it("weights average performance by headcount, not by a flat node count", () => {
    const tree = buildTree(sampleNodes);
    const values = collectInitialValues(sampleNodes);
    const aggregates = aggregateTree(tree.roots, values);

    const deptAggregate = aggregates.get("dept")!;
    // dept(1@60) + team-a(10@90) + team-b(5@60) => (60 + 900 + 300) / 16 = 78.75
    expect(weightedPerformance(deptAggregate, 0)).toBeCloseTo(78.75, 5);
  });

  it("falls back to the node's own performance when subtree headcount is zero", () => {
    const zeroHeadcountNodes: OrgNode[] = [
      node({ id: "empty-div", parentId: null, headcount: 0, budget: 0, performance: 42 }),
    ];
    const tree = buildTree(zeroHeadcountNodes);
    const values = collectInitialValues(zeroHeadcountNodes);
    const aggregates = aggregateTree(tree.roots, values);

    expect(weightedPerformance(aggregates.get("empty-div")!, 42)).toBe(42);
  });

  it("incrementally patches only the affected node and its ancestors, matching a full recompute", () => {
    const tree = buildTree(sampleNodes);
    const initialValues = collectInitialValues(sampleNodes);
    const before = aggregateTree(tree.roots, initialValues);

    const patchedValues = new Map(initialValues);
    patchedValues.set("team-a", { headcount: 14, budget: 2_500, performance: 70, updatedAt: now });

    const incremental = applyPatchToAggregates(
      tree,
      before,
      "team-a",
      initialValues.get("team-a")!,
      patchedValues.get("team-a")!,
    );
    const fromScratch = aggregateTree(tree.roots, patchedValues);

    for (const id of ["team-a", "dept", "div"]) {
      expect(incremental.get(id)).toEqual(fromScratch.get(id));
    }
    // team-b was untouched by the patch, so its (unrelated sibling) aggregate is unchanged.
    expect(incremental.get("team-b")).toEqual(before.get("team-b"));
  });
});
