import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const LITEAPI_KEY = Deno.env.get("LITEAPI_KEY") || "sand_c0155ab8-c683-4f26-8f94-b5e92c5797b9";
const LITEAPI_BASE_URL = "https://api.liteapi.travel/v3.0";
const LITEAPI_BOOK_URL = "https://book.liteapi.travel/v3.0";

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace("/liteapi", "");
    const { method, endpoint, body: requestBody } = await req.json().catch(() => ({}));

    let response: Response;
    let apiUrl: string;
    let apiBody: any = null;

    // Determine endpoint and URL
    switch (endpoint) {
      case "places": {
        const { textQuery } = requestBody || {};
        if (!textQuery) {
          return new Response(
            JSON.stringify({ error: { message: "textQuery is required" } }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        apiUrl = `${LITEAPI_BASE_URL}/data/places?textQuery=${encodeURIComponent(textQuery)}`;
        break;
      }

      case "rates": {
        apiUrl = `${LITEAPI_BASE_URL}/hotels/rates`;
        apiBody = requestBody;
        break;
      }

      case "prebook": {
        apiUrl = `${LITEAPI_BOOK_URL}/rates/prebook`;
        apiBody = requestBody;
        break;
      }

      case "book": {
        apiUrl = `${LITEAPI_BOOK_URL}/rates/book`;
        apiBody = requestBody;
        break;
      }

      case "hotel": {
        const { hotelId } = requestBody || {};
        if (!hotelId) {
          return new Response(
            JSON.stringify({ error: { message: "hotelId is required" } }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        apiUrl = `${LITEAPI_BASE_URL}/data/hotel?hotelId=${hotelId}&timeout=4`;
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: { message: "Invalid endpoint" } }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    // Make request to LiteAPI
    const headers: Record<string, string> = {
      "X-API-Key": LITEAPI_KEY,
      "accept": "application/json",
    };

    if (apiBody) {
      headers["content-type"] = "application/json";
    }

    response = await fetch(apiUrl, {
      method: apiBody ? "POST" : "GET",
      headers,
      body: apiBody ? JSON.stringify(apiBody) : undefined,
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: { message: error.message } }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
