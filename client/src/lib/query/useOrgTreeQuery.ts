import { useCallback } from "react";
import { parseOrgTreeResponse, type OrgNode } from "@/lib/schema/orgNode";
import { useQuery, type UseQueryResult } from "./useQuery";

const ORG_TREE_KEY = "/api/org-tree";
const STALE_TIME_MS = 5_000;

async function fetchOrgTree(signal: AbortSignal): Promise<OrgNode[]> {
  const response = await fetch(ORG_TREE_KEY, { signal });
  if (!response.ok) {
    throw new Error(`Сервер вернул ошибку ${response.status}`);
  }
  const payload: unknown = await response.json();
  return parseOrgTreeResponse(payload);
}

export function useOrgTreeQuery(): UseQueryResult<OrgNode[]> {
  const fetcher = useCallback((signal: AbortSignal) => fetchOrgTree(signal), []);
  return useQuery({ key: ORG_TREE_KEY, fetcher, staleTime: STALE_TIME_MS });
}
