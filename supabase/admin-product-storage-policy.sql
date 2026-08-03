-- Yenni Crochet Admin - product image uploads
-- Run in Supabase Dashboard -> SQL Editor if admin product image upload is denied.
--
-- Bucket name is case-sensitive. The shop currently uses the public bucket:
-- Products
--
-- Admin web uploads product images to:
-- Products/products/<file-name>
-- Products/vouchers/<file-name>

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

drop policy if exists "products_admin_images_upload" on storage.objects;
create policy "products_admin_images_upload"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'Products'
    and name like 'products/%'
    and private.is_admin()
  );

drop policy if exists "products_admin_images_update" on storage.objects;
create policy "products_admin_images_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'Products'
    and name like 'products/%'
    and private.is_admin()
  )
  with check (
    bucket_id = 'Products'
    and name like 'products/%'
    and private.is_admin()
  );

drop policy if exists "vouchers_admin_banners_upload" on storage.objects;
create policy "vouchers_admin_banners_upload"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'Products'
    and name like 'vouchers/%'
    and private.is_admin()
  );

drop policy if exists "vouchers_admin_banners_update" on storage.objects;
create policy "vouchers_admin_banners_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'Products'
    and name like 'vouchers/%'
    and private.is_admin()
  )
  with check (
    bucket_id = 'Products'
    and name like 'vouchers/%'
    and private.is_admin()
  );
