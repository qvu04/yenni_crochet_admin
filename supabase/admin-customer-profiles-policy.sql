  create schema if not exists private;

  alter table public.customer_profiles enable row level security;

  drop policy if exists "customer_profiles_admin_select" on public.customer_profiles;
  create policy "customer_profiles_admin_select"
    on public.customer_profiles for select
    using (private.is_admin());

  drop policy if exists "customer_profiles_admin_update" on public.customer_profiles;
  create policy "customer_profiles_admin_update"
    on public.customer_profiles for update
    using (private.is_admin())
    with check (private.is_admin());

