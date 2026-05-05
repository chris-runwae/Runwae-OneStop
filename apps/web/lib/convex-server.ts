import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import type { FunctionReference } from "convex/server";

export async function fetchAuthedQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: Query["_args"],
): Promise<Query["_returnType"]> {
  const token = await convexAuthNextjsToken();
  return fetchQuery(query, args, token ? { token } : undefined);
}
