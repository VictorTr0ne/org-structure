import { useEffect, useRef, useState } from "react";
import { parseOrgNodePatch, type OrgNodePatch } from "@/lib/schema/orgNodePatch";

export type ConnectionStatus = "connecting" | "open" | "reconnecting" | "offline";

const INITIAL_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;

function buildSocketUrl(): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
}

export interface UseOrgTreeSocketOptions {
  onPatch: (patch: OrgNodePatch) => void;
}

/** Live-updates channel with exponential backoff reconnect; drives the header's connection indicator. */
export function useOrgTreeSocket({ onPatch }: UseOrgTreeSocketOptions): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const onPatchRef = useRef(onPatch);
  onPatchRef.current = onPatch;

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    let cancelled = false;

    const connect = () => {
      setStatus(attempt === 0 ? "connecting" : "reconnecting");
      socket = new WebSocket(buildSocketUrl());

      socket.onopen = () => {
        attempt = 0;
        setStatus("open");
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        try {
          const payload: unknown = JSON.parse(event.data);
          const patch = parseOrgNodePatch(payload);
          if (patch) onPatchRef.current(patch);
        } catch {
          // Malformed frame: ignore it, the connection itself is still healthy.
        }
      };

      socket.onclose = () => {
        if (cancelled) return;
        setStatus("offline");
        attempt += 1;
        const delay = Math.min(MAX_BACKOFF_MS, INITIAL_BACKOFF_MS * 2 ** (attempt - 1));
        reconnectTimeout = setTimeout(connect, delay);
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimeout);
      socket?.close();
    };
  }, []);

  return status;
}
