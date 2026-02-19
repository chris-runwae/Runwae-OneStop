import express, { Request, Response, NextFunction } from "express";
import { demoUsers } from "./db/schema";
import { db } from "./db";

const app = express();
const PORT = Number(process.env.PORT) || 8000;

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "runwae-backend" });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

//Test DB connection
app.post("/db-test", async (_req: Request, res: Response) => {
  const { name } = _req.body;

  try {
    const result = await db.insert(demoUsers).values({ name });
    res.json({ status: "ok", data: result });
  } catch (error) {
    const err = error as Error;
    console.error("DB error:", err?.message ?? err);
    res.status(500).json({
      status: "error",
      message: "Database operation failed",
      error: err?.message ?? String(error),
    });
  }
});

app.get("/db-test", async (_req: Request, res: Response) => {
  try {
    const result = await db.select().from(demoUsers);
    res.json({ status: "ok", data: result });
  } catch (error) {
    const err = error as Error;
    console.error("DB error:", err?.message ?? err);
    res.status(500).json({
      status: "error",
      message: "Database operation failed",
      error: err?.message ?? String(error),
    });
  }
});
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.message, err.stack);
  res.status(err.status ?? 500).json({
    error: err.message ?? "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
