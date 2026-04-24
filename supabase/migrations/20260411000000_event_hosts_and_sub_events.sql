-- Run this migration in the Supabase SQL editor or via `supabase db push`
-- when you are ready to persist hosts and sub-events for an event.

create table if not exists public.event_hosts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  email text not null,
  show_on_page boolean not null default true,
  is_manager boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists event_hosts_event_id_idx on public.event_hosts (event_id);

create table if not exists public.event_sub_events (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  starts_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists event_sub_events_event_id_idx on public.event_sub_events (event_id);

alter table public.event_hosts enable row level security;
alter table public.event_sub_events enable row level security;

create policy "event_hosts_select_own_events"
  on public.event_hosts for select to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = event_hosts.event_id and e.user_id = auth.uid()
    )
  );

create policy "event_hosts_insert_own_events"
  on public.event_hosts for insert to authenticated
  with check (
    exists (
      select 1 from public.events e
      where e.id = event_hosts.event_id and e.user_id = auth.uid()
    )
  );

create policy "event_hosts_update_own_events"
  on public.event_hosts for update to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = event_hosts.event_id and e.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events e
      where e.id = event_hosts.event_id and e.user_id = auth.uid()
    )
  );

create policy "event_hosts_delete_own_events"
  on public.event_hosts for delete to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = event_hosts.event_id and e.user_id = auth.uid()
    )
  );

create policy "event_sub_events_select_own_events"
  on public.event_sub_events for select to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = event_sub_events.event_id and e.user_id = auth.uid()
    )
  );

create policy "event_sub_events_insert_own_events"
  on public.event_sub_events for insert to authenticated
  with check (
    exists (
      select 1 from public.events e
      where e.id = event_sub_events.event_id and e.user_id = auth.uid()
    )
  );

create policy "event_sub_events_update_own_events"
  on public.event_sub_events for update to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = event_sub_events.event_id and e.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events e
      where e.id = event_sub_events.event_id and e.user_id = auth.uid()
    )
  );

create policy "event_sub_events_delete_own_events"
  on public.event_sub_events for delete to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = event_sub_events.event_id and e.user_id = auth.uid()
    )
  );
