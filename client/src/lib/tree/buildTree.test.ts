import { describe, expect, it } from "vitest";
import type { OrgNode } from "@/lib/schema/orgNode";
import { buildTree, getAncestorIds } from "./buildTree";

const nodes: OrgNode[] = [
  { id: "div", name: "Div", parentId: null, headcount: 1, budget: 1, performance: 1, updatedAt: "" },
  { id: "dept", name: "Dept", parentId: "div", headcount: 1, budget: 1, performance: 1, updatedAt: "" },
  { id: "team", name: "Team", parentId: "dept", headcount: 1, budget: 1, performance: 1, updatedAt: "" },
];

describe("buildTree", () => {
  it("nests children under their parent and assigns depth starting at 1 for roots", () => {
    const { roots } = buildTree(nodes);
    expect(roots).toHaveLength(1);
    expect(roots[0]?.depth).toBe(1);
    expect(roots[0]?.children[0]?.depth).toBe(2);
    expect(roots[0]?.children[0]?.children[0]?.depth).toBe(3);
  });

  it("treats a node with an unknown parentId as a root instead of dropping it", () => {
    const { roots } = buildTree([
      ...nodes,
      { id: "orphan", name: "Orphan", parentId: "missing", headcount: 1, budget: 1, performance: 1, updatedAt: "" },
    ]);
    expect(roots.map((r) => r.id)).toContain("orphan");
  });
});

describe("getAncestorIds", () => {
  it("walks from immediate parent up to the root", () => {
    const { byId } = buildTree(nodes);
    expect(getAncestorIds(byId, "team")).toEqual(["dept", "div"]);
    expect(getAncestorIds(byId, "div")).toEqual([]);
  });
});
