-- Fresh database only. This is not an upgrade for the existing hosted table.
-- Apply the whole file in one transaction (CLI migration runner or psql -1).
set local lock_timeout = '5s';
set local statement_timeout = '30s';

create table public.applications (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  website text,
  logo_url text,
  date_applied date not null,
  status text not null default 'Applied',
  notes text,
  constraint applications_company_length_check
    check (char_length(btrim(company)) between 2 and 50),
  constraint applications_role_length_check
    check (char_length(btrim(role)) between 2 and 80),
  constraint applications_status_check
    check (status in ('Applied', 'Interview', 'Offer', 'Rejected')),
  constraint applications_notes_length_check
    check (char_length(notes) <= 500)
);

-- Supports the owner's newest-first list and lookups by user_id.
create index applications_user_created_at_idx
  on public.applications (user_id, created_at desc);

alter table public.applications enable row level security;

create policy "Users can view their own applications"
  on public.applications for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own applications"
  on public.applications for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own applications"
  on public.applications for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own applications"
  on public.applications for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Replace any default client grants on these newly created objects.
revoke all privileges on table public.applications
  from public, anon, authenticated;
revoke all privileges on sequence public.applications_id_seq
  from public, anon, authenticated;

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.applications
  to authenticated;
