import { useCallback, useEffect, useSyncExternalStore } from "react";

export type QueryStatus = "loading" | "success" | "error";

interface QueryState<T> {
  status: QueryStatus;
  data: T | undefined;
  error: unknown;
  fetchedAt: number;
}

interface CacheEntry<T> {
  state: QueryState<T>;
  subscribers: Set<() => void>;
  inFlight: AbortSignal | null;
}

// Module-level so every component instance querying the same key shares one cached entry.
const cache = new Map<string, CacheEntry<unknown>>();

function getEntry<T>(key: string): CacheEntry<T> {
  let entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) {
    entry = {
      state: { status: "loading", data: undefined, error: undefined, fetchedAt: 0 },
      subscribers: new Set(),
      inFlight: null,
    };
    cache.set(key, entry as CacheEntry<unknown>);
  }
  return entry;
}

function notify<T>(entry: CacheEntry<T>): void {
  entry.subscribers.forEach((callback) => callback());
}

function runFetch<T>(
  entry: CacheEntry<T>,
  fetcher: (signal: AbortSignal) => Promise<T>,
  signal: AbortSignal,
): void {
  if (entry.inFlight) return; // a fetch for this key is already in flight, dedupe
  entry.inFlight = signal;
  if (entry.state.data === undefined) {
    entry.state = { ...entry.state, status: "loading" };
    notify(entry);
  }
  fetcher(signal)
    .then((data) => {
      entry.state = { status: "success", data, error: undefined, fetchedAt: Date.now() };
    })
    .catch((error: unknown) => {
      if (signal.aborted) return; // unmount/cleanup, not a real failure
      entry.state = { ...entry.state, status: "error", error };
    })
    .finally(() => {
      // A newer call may already own `inFlight` (see the effect cleanup below, which releases
      // it eagerly on abort) — only clear it if it's still ours, so we don't clobber that one.
      if (entry.inFlight === signal) {
        entry.inFlight = null;
      }
      notify(entry);
    });
}

export interface UseQueryOptions<T> {
  key: string;
  fetcher: (signal: AbortSignal) => Promise<T>;
  /** Time in ms during which cached data is served without triggering a network request. */
  staleTime: number;
}

export interface UseQueryResult<T> {
  status: QueryStatus;
  data: T | undefined;
  error: unknown;
  refetch: () => void;
}

/**
 * Minimal stale-while-revalidate query hook: serves cached data instantly while it is within
 * staleTime, revalidates in the background otherwise, dedupes concurrent fetches for the same
 * key, and aborts the underlying request when the consuming component unmounts.
 */
export function useQuery<T>({ key, fetcher, staleTime }: UseQueryOptions<T>): UseQueryResult<T> {
  const entry = getEntry<T>(key);

  const subscribe = useCallback(
    (callback: () => void) => {
      entry.subscribers.add(callback);
      return () => entry.subscribers.delete(callback);
    },
    [entry],
  );
  const getSnapshot = useCallback(() => entry.state, [entry]);
  const state = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    const isFresh = entry.state.data !== undefined && Date.now() - entry.state.fetchedAt < staleTime;
    if (isFresh) return;
    const controller = new AbortController();
    runFetch(entry, fetcher, controller.signal);
    return () => {
      controller.abort();
      // Release the dedupe lock immediately (rather than waiting for the aborted fetch's
      // own .finally, which lands on a later microtask) so React 18 StrictMode's dev-mode
      // mount -> cleanup -> mount doesn't leave the second mount's effect finding a
      // (stale, aborted) fetch "in flight" and skipping its own request forever.
      if (entry.inFlight === controller.signal) {
        entry.inFlight = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry, key, staleTime]);

  const refetch = useCallback(() => {
    runFetch(entry, fetcher, new AbortController().signal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry]);

  return { status: state.status, data: state.data, error: state.error, refetch };
}
