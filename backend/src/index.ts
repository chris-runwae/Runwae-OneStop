import express, { Request, Response, NextFunction } from "express";

const app = express();
const PORT = Number(process.env.PORT) || 8000;

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "runwae-backend" });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
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
