import type { WebSocketServer, WebSocket } from "ws";
import { applyMutation, getLeafNodeIds, getNode } from "../data/store.js";
import type { OrgNodePatch } from "../types.js";

const MIN_INTERVAL_MS = 3_000;
const MAX_INTERVAL_MS = 8_000;

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Produces a plausible small change for one randomly chosen metric on a leaf (team) node. */
function mutateRandomLeaf(): OrgNodePatch | undefined {
  const leafIds = getLeafNodeIds();
  if (leafIds.length === 0) return undefined;
  const nodeId = leafIds[Math.floor(Math.random() * leafIds.length)] as string;
  const node = getNode(nodeId);
  if (!node) return undefined;

  const field = (["headcount", "budget", "performance"] as const)[
    Math.floor(Math.random() * 3)
  ] as "headcount" | "budget" | "performance";

  let changes: Partial<Record<typeof field, number>>;
  if (field === "headcount") {
    const delta = Math.random() < 0.5 ? -1 : 1;
    changes = { headcount: clamp(node.headcount + delta, 1, 60) };
  } else if (field === "budget") {
    const delta = Math.round(randomBetween(-150_000, 200_000));
    changes = { budget: clamp(node.budget + delta, 100_000, 10_000_000) };
  } else {
    const delta = Math.round(randomBetween(-6, 6));
    changes = { performance: clamp(node.performance + delta, 0, 100) };
  }

  const updated = applyMutation(nodeId, changes);
  if (!updated) return undefined;

  return {
    type: "update",
    nodeId,
    changes: { ...changes, updatedAt: updated.updatedAt },
  };
}

function broadcast(wss: WebSocketServer, patch: OrgNodePatch): void {
  const payload = JSON.stringify(patch);
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  });
}

/** Starts an unbounded chain of randomly-spaced mutations, simulating organic org-data drift. */
export function startRealtimeMutations(wss: WebSocketServer): () => void {
  let timeoutHandle: ReturnType<typeof setTimeout>;
  let stopped = false;

  const tick = () => {
    if (stopped) return;
    const patch = mutateRandomLeaf();
    if (patch && wss.clients.size > 0) {
      broadcast(wss, patch);
    }
    timeoutHandle = setTimeout(tick, randomBetween(MIN_INTERVAL_MS, MAX_INTERVAL_MS));
  };

  timeoutHandle = setTimeout(tick, randomBetween(MIN_INTERVAL_MS, MAX_INTERVAL_MS));

  return () => {
    stopped = true;
    clearTimeout(timeoutHandle);
  };
}
