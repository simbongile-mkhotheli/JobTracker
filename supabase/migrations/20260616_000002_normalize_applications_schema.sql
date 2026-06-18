alter table public.applications
rename column "logoUrl" to logo_url;

alter table public.applications
rename column "dateApplied" to date_applied;

drop policy if exists "Users can view their own applications" on public.applications;
drop policy if exists "Users can insert their own applications" on public.applications;
drop policy if exists "Users can update their own applications" on public.applications;
drop policy if exists "Users can delete their own applications" on public.applications;

alter table public.applications enable row level security;

create policy "Users can view their own applications"
on public.applications
for select
using (auth.uid() = user_id);

create policy "Users can insert their own applications"
on public.applications
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own applications"
on public.applications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own applications"
on public.applications
for delete
using (auth.uid() = user_id);
