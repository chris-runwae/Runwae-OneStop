import { readFile } from "node:fs/promises";
import path from "node:path";

function resolve(file: string) {
  return path.join(process.cwd(), "static-html", file);
}

export async function readBodyHtml(file: "index.html" | "partners.html") {
  const html = await readFile(resolve(file), "utf8");
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = match ? match[1] : html;
  return body.replace(/<script\b[^>]*src=["']main\.js["'][^>]*>\s*<\/script>/gi, "");
}

export async function readFragment(file: string) {
  return (await readFile(resolve(file), "utf8")).trim();
}
