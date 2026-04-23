-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Products Table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  is_visible boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Note: The orders table already exists in the project as per app/admin/page.tsx, but here is the presumed schema:
-- create table public.orders (
--   id uuid default uuid_generate_v4() primary key,
--   full_name text not null,
--   phone_number text not null,
--   items jsonb,
--   photo_url text,
--   status text default 'PENDING',
--   created_at timestamp with time zone default timezone('utc'::text, now()) not null
-- );

-- Enable RLS
alter table public.products enable row level security;
-- alter table public.orders enable row level security;

-- Policies for products
-- Allow public read access to visible products
create policy "Public can view visible products" 
on public.products for select 
using (is_visible = true);

-- Allow admins to do everything (assuming service role or authenticated admin)
-- In this simplified version, we just let authenticated users (admin) do everything
create policy "Admins can insert products" 
on public.products for insert 
to authenticated 
with check (true);

create policy "Admins can update products" 
on public.products for update 
to authenticated 
using (true);

create policy "Admins can delete products" 
on public.products for delete 
to authenticated 
using (true);

create policy "Admins can view all products" 
on public.products for select 
to authenticated 
using (true);

-- Storage configuration
insert into storage.buckets (id, name, public) values ('products', 'products', true);

create policy "Public can view product images"
on storage.objects for select
using ( bucket_id = 'products' );

create policy "Admins can upload product images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'products' );

create policy "Admins can update product images"
on storage.objects for update
to authenticated
using ( bucket_id = 'products' );

create policy "Admins can delete product images"
on storage.objects for delete
to authenticated
using ( bucket_id = 'products' );
