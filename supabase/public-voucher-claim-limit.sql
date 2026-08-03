-- Yenni Crochet - public voucher claim limit
-- Run in Supabase Dashboard -> SQL Editor.
--
-- This makes usage_limit mean "claim/receive limit" for public vouchers:
-- - public customers can only claim vouchers with visibility = 'public'
-- - one Zalo user can claim one promotion once
-- - when count(user_promotions) reaches usage_limit, later claims are rejected

alter table public.promotions
  add column if not exists visibility text not null default 'private';

alter table public.promotions
  drop constraint if exists promotions_visibility_check;

alter table public.promotions
  add constraint promotions_visibility_check
  check (visibility in ('public', 'private'));

create unique index if not exists user_promotions_unique_user_promotion
  on public.user_promotions (promotion_id, zalo_user_id);

create index if not exists user_promotions_promotion_claim_count_idx
  on public.user_promotions (promotion_id);

create or replace function public.claim_user_promotion(
  p_promotion_id uuid,
  p_zalo_user_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_promotion public.promotions%rowtype;
  v_claimed_count integer;
begin
  if p_zalo_user_id is null or btrim(p_zalo_user_id) = '' then
    raise exception 'Thiếu Zalo user id';
  end if;

  select *
  into v_promotion
  from public.promotions
  where id = p_promotion_id
  for update;

  if not found then
    raise exception 'Voucher không tồn tại';
  end if;

  if v_promotion.is_active is not true then
    raise exception 'Voucher chưa được bật';
  end if;

  if coalesce(v_promotion.visibility, 'private') <> 'public' then
    raise exception 'Voucher này chỉ được cấp bởi shop';
  end if;

  if v_promotion.start_date > current_date then
    raise exception 'Voucher chưa bắt đầu';
  end if;

  if v_promotion.end_date < current_date then
    raise exception 'Voucher đã hết hạn';
  end if;

  if exists (
    select 1
    from public.user_promotions up
    where up.promotion_id = p_promotion_id
      and up.zalo_user_id = p_zalo_user_id
  ) then
    raise exception 'Bạn đã đổi voucher này rồi';
  end if;

  select count(*)
  into v_claimed_count
  from public.user_promotions up
  where up.promotion_id = p_promotion_id;

  if v_promotion.usage_limit is not null
    and v_claimed_count >= v_promotion.usage_limit then
    raise exception 'Voucher đã hết lượt đổi';
  end if;

  insert into public.user_promotions (
    promotion_id,
    zalo_user_id,
    status,
    claimed_at
  )
  values (
    p_promotion_id,
    p_zalo_user_id,
    'claimed',
    now()
  );
end;
$$;

revoke all on function public.claim_user_promotion(uuid, text) from public;
grant execute on function public.claim_user_promotion(uuid, text) to anon, authenticated;
