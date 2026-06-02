import { readFile } from "node:fs/promises";
import path from "node:path";

export async function readBodyHtml(file: "index.html" | "partners.html") {
  const full = path.join(process.cwd(), "static-html", file);
  const html = await readFile(full, "utf8");
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = match ? match[1] : html;
  return body.replace(/<script\b[^>]*src=["']main\.js["'][^>]*>\s*<\/script>/gi, "");
}
