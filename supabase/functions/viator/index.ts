// supabase/functions/viator/index.ts
export default async function handler(req: Request): Promise<Response> {
  const VIATOR_API_KEY = Deno.env.get("VIATOR_API_KEY");

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { endpoint, method = "GET", params = {}, headers = {}, body } = await req.json();

    const response = await fetch(`https://api.viator.com/partner/${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${VIATOR_API_KEY}`,
        ...headers
      },
      body: method === "GET" ? undefined : JSON.stringify(body ?? params)
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: response.status
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  }
}
