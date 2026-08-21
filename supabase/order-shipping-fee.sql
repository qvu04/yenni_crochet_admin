alter table public.orders
add column if not exists shipping_fee integer not null default 0;

update public.orders
set shipping_fee = 0
where shipping_fee is null;
