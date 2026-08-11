update public.orders
set status = case
  when status = 'pending' then 'awaiting_confirmation'
  when status in ('completed') then 'done'
  when status in ('canceled') then 'cancelled'
  when status in ('delivering') then 'shipping'
  else status
end
where status in ('pending', 'completed', 'canceled', 'delivering');

alter table public.orders
alter column status set default 'awaiting_confirmation';

alter table public.orders
drop constraint if exists orders_status_check;

alter table public.orders
add constraint orders_status_check
check (
  status in (
    'awaiting_confirmation',
    'confirmed',
    'making',
    'shipping',
    'done',
    'cancelled'
  )
);

