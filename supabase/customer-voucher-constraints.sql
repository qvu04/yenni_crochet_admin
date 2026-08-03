-- Yenni Crochet Admin - customer voucher safety rules
-- Run in Supabase Dashboard -> SQL Editor after reviewing existing duplicates.
--
-- This guarantees one Zalo user can hold a specific voucher only once.
-- It protects both admin grants and customer self-claim flows.
--
-- Optional duplicate check before creating the unique index:
-- select promotion_id, zalo_user_id, count(*)
-- from public.user_promotions
-- group by promotion_id, zalo_user_id
-- having count(*) > 1;

create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.id = auth.uid()
      and ap.role = 'admin'
      and ap.is_active is true
  );
$$;

revoke all on schema private from public;
grant usage on schema private to authenticated;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

alter table public.user_promotions enable row level security;

drop policy if exists "user_promotions_admin_manage" on public.user_promotions;
create policy "user_promotions_admin_manage"
  on public.user_promotions
  for all
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create unique index if not exists user_promotions_unique_user_promotion
  on public.user_promotions (promotion_id, zalo_user_id);
