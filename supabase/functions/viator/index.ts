// supabase/functions/viator/index.ts
// export const config = {
//   runtime: "edge",
//   allowUnauthenticated: true,
// };

// export default async function handler(req: Request): Promise<Response> {
//   console.log("Request received:", req);
//   const VIATOR_API_KEY = Deno.env.get("VIATOR_API_KEY");
//   const supabaseKey = Deno.env.get("SUPABASE_KEY");
//   console.log("VIATOR_API_KEY loaded?", !!VIATOR_API_KEY);

//   if (req.method !== "POST") {
//     return new Response("Method not allowed", { status: 405 });
//   }

//   try {
//     console.log("Incoming headers:", Object.fromEntries(req.headers.entries()));
//     const { endpoint, method = "GET", params = {}, headers = {}, body } = await req.json();

//     console.log("Sending headers to Viator:", {
//       "Accept": "application/json",
//       "Content-Type": "application/json",
//       "exp-api-key": VIATOR_API_KEY ? "[HIDDEN]" : "MISSING",
//       "Authorization": `Bearer ${supabaseKey}`,
//       "apikey": supabaseKey,
//     });

//     const response = await fetch(`https://api.viator.com/partner/${endpoint}`, {
//       method,
//       headers: {
//         "Content-Type": "application/json",
//         "Accept": "application/json;version=2.0",
//         "exp-api-key": `${VIATOR_API_KEY}`,
//         ...headers
//       },
//       body: method === "GET" ? undefined : JSON.stringify(body ?? params)
//     });

//     const data = await response.json();
//     return new Response(JSON.stringify(data), {
//       headers: { "Content-Type": "application/json" },
//       status: response.status
//     });
//   } catch (err) {
//     return new Response(JSON.stringify({ error: err.message }), {
//       headers: { "Content-Type": "application/json" },
//       status: 500
//     });
//   }
// }


// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Hello from Viator!")

// @ts-ignore
Deno.serve(async (req) => {
  const { name } = await req.json()
  const data = {
    message: `Hello ${name}!`,
  }

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})
