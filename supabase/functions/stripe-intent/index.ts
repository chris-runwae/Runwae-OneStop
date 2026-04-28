import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
});

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

  try {
    const { amount, currency } = await req.json();

    if (amount == null || !currency) {
      return new Response(JSON.stringify({ error: 'amount and currency are required' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100), // convert to smallest currency unit (e.g. pence for GBP)
      currency: (currency as string).toLowerCase(),
      payment_method_types: ['card'],
    });

    return new Response(JSON.stringify({ clientSecret: intent.client_secret }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
