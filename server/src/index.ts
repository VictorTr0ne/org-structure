import cors from "cors";
import express from "express";
import { getAllNodes } from "./data/store.js";

const PORT = Number(process.env.PORT ?? 3001);

const app = express();
app.use(cors());

app.get("/api/org-tree", (_req, res) => {
  res.json(getAllNodes());
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`org-dashboard mock API listening on http://localhost:${PORT}`);
});
