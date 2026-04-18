import { supabase } from './client';

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  amountPaid: number | null;
  currency: string | null;
  stripePaymentIntent: string | null;
  createdAt: string;
}

function mapRow(row: Record<string, unknown>): EventRegistration {
  return {
    id: row.id as string,
    eventId: row.event_id as string,
    userId: row.user_id as string,
    status: row.status as 'pending' | 'confirmed' | 'cancelled',
    amountPaid: (row.amount_paid as number | null) ?? null,
    currency: (row.currency as string | null) ?? null,
    stripePaymentIntent: (row.stripe_payment_intent as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function registerForEvent(
  eventId: string,
  userId: string,
  opts: { amountPaid?: number; currency?: string; stripePaymentIntent?: string } = {}
): Promise<EventRegistration> {
  const { data, error } = await supabase
    .from('event_registrations')
    .upsert(
      {
        event_id: eventId,
        user_id: userId,
        status: 'confirmed',
        amount_paid: opts.amountPaid ?? null,
        currency: opts.currency ?? null,
        stripe_payment_intent: opts.stripePaymentIntent ?? null,
      },
      { onConflict: 'event_id,user_id' }
    )
    .select()
    .single();

  if (error) throw new Error(error.message || 'Failed to register for event');
  return mapRow(data as Record<string, unknown>);
}

export async function getUserEventRegistrations(userId: string): Promise<EventRegistration[]> {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Record<string, unknown>[]).map(mapRow);
}

export async function getEventRegistration(
  eventId: string,
  userId: string
): Promise<EventRegistration | null> {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data as Record<string, unknown>) : null;
}
