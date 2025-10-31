// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Hello from Functions!")

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

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Get your local anon key by running: `supabase status` (look for "Publishable key")
  3. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/testEdge' \
    --header 'Authorization: Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

    Disable verify_jwt
    curl -L -X POST 'https://zvicmujgveepxbekpzkf.supabase.co/functions/v1/testEdge' \
  -H 'Authorization: Bearer sb_publishable_mqgg1s3ju01R7hEKMYq-0Q_ASYM8Ywl' \
  -H 'apikey: sb_publishable_mqgg1s3ju01R7hEKMYq-0Q_ASYM8Ywl' \
  -H 'Content-Type: application/json' \
  --data '{"name":"Functions"}'

  Note: Replace YOUR_ANON_KEY_HERE with the "Publishable key" from `supabase status`
  The hardcoded token above is a default JWT for local dev, but using your actual anon key is recommended.
    
*/
