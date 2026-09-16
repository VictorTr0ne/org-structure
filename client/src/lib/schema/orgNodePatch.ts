import { z } from "zod";

export const orgNodePatchSchema = z.object({
  type: z.literal("update"),
  nodeId: z.string().min(1),
  changes: z
    .object({
      headcount: z.number().int().nonnegative().optional(),
      budget: z.number().nonnegative().optional(),
      performance: z.number().min(0).max(100).optional(),
      updatedAt: z.string(),
    })
    .refine(
      (changes) =>
        changes.headcount !== undefined ||
        changes.budget !== undefined ||
        changes.performance !== undefined,
      { message: "Патч должен менять хотя бы одно поле" },
    ),
});

export type OrgNodePatch = z.infer<typeof orgNodePatchSchema>;

/** Returns null (instead of throwing) so one malformed WS frame never kills the socket loop. */
export function parseOrgNodePatch(payload: unknown): OrgNodePatch | null {
  const result = orgNodePatchSchema.safeParse(payload);
  return result.success ? result.data : null;
}
