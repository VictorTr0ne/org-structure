import { z } from "zod";

export const orgNodeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  parentId: z.string().min(1).nullable(),
  headcount: z.number().int().nonnegative(),
  budget: z.number().nonnegative(),
  performance: z.number().min(0).max(100),
  updatedAt: z.string(),
});

export const orgTreeResponseSchema = z.array(orgNodeSchema);

export type OrgNode = z.infer<typeof orgNodeSchema>;

export class OrgTreeValidationError extends Error {
  readonly issues: z.ZodIssue[];

  constructor(issues: z.ZodIssue[]) {
    super("Ответ API не соответствует ожидаемой схеме org-tree");
    this.name = "OrgTreeValidationError";
    this.issues = issues;
  }
}

/** Throws OrgTreeValidationError on any schema mismatch instead of returning invalid data. */
export function parseOrgTreeResponse(payload: unknown): OrgNode[] {
  const result = orgTreeResponseSchema.safeParse(payload);
  if (!result.success) {
    throw new OrgTreeValidationError(result.error.issues);
  }
  return result.data;
}
