import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import { WebSocketServer } from "ws";
import { getAllNodes } from "./data/store.js";
import { startRealtimeMutations } from "./realtime/broadcaster.js";

const PORT = Number(process.env.PORT ?? 3001);

const app = express();
app.use(cors());

app.get("/api/org-tree", (_req, res) => {
  res.json(getAllNodes());
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

startRealtimeMutations(wss);

httpServer.listen(PORT, () => {
  console.log(`org-dashboard mock API listening on http://localhost:${PORT}`);
  console.log(`WebSocket live-updates available on ws://localhost:${PORT}/ws`);
});
