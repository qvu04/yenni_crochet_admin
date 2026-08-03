-- Yenni Crochet Admin - private/public voucher visibility
-- Run in Supabase Dashboard -> SQL Editor before using private voucher fields.
--
-- Current strategy before loyalty exists:
-- - private: admin grants directly to a specific Zalo user via user_promotions.
-- - public: shown in the mini app voucher tab for everyone to claim.
--
-- IMPORTANT: update the mini app public voucher query to include:
--   .eq('visibility', 'public')

alter table public.promotions
  add column if not exists visibility text not null default 'private';

alter table public.promotions
  drop constraint if exists promotions_visibility_check;

alter table public.promotions
  add constraint promotions_visibility_check
  check (visibility in ('public', 'private'));

create index if not exists promotions_visibility_active_dates_idx
  on public.promotions (visibility, is_active, start_date, end_date);

update public.promotions
set visibility = 'private'
where visibility is null
   or visibility not in ('public', 'private');
