-- =============================================
-- Hikayatki Database Schema (Full)
-- Last updated: 2026-05-14
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- Core Tables
-- =============================================

-- Main Categories (parent level)
create table public.main_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  display_order int default 0,
  created_at timestamptz default now()
);

-- Sub-categories (child level)
create table public.sub_categories (
  id uuid default gen_random_uuid() primary key,
  main_category_id uuid not null references public.main_categories(id) on delete cascade,
  name text not null,
  slug text not null,
  is_composable boolean default false,
  display_order int default 0,
  created_at timestamptz default now(),
  unique(main_category_id, slug)
);

-- Products Table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  is_visible boolean default true,
  sub_category_id uuid references public.sub_categories(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Raw Materials
create table public.raw_materials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric default 0,
  image_url text,
  is_visible boolean default true,
  created_at timestamptz default now()
);

-- Junction: sub_category_materials
create table public.sub_category_materials (
  sub_category_id uuid not null references public.sub_categories(id) on delete cascade,
  raw_material_id uuid not null references public.raw_materials(id) on delete cascade,
  primary key (sub_category_id, raw_material_id)
);

-- Orders Table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  full_name text not null default '',
  phone_number text not null,
  items jsonb default '[]'::jsonb,
  photo_url text,
  status text default 'PENDING',
  wilaya text,
  commune text,
  address text,
  yalidine_tracking text,
  order_type text default 'composer',
  composer_sub_category_id uuid references public.sub_categories(id) on delete set null,
  selected_materials jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Store Settings
create table public.store_settings (
  key text primary key,
  value text not null
);

-- =============================================
-- RLS Policies
-- =============================================

-- Products
alter table public.products enable row level security;
create policy "Public can view visible products" on public.products for select using (is_visible = true);
create policy "Admins can insert products" on public.products for insert to authenticated with check (true);
create policy "Admins can update products" on public.products for update to authenticated using (true);
create policy "Admins can delete products" on public.products for delete to authenticated using (true);
create policy "Admins can view all products" on public.products for select to authenticated using (true);

-- Orders
alter table public.orders enable row level security;

-- Main Categories
alter table public.main_categories enable row level security;
create policy "Public can view main categories" on public.main_categories for select using (true);
create policy "Admins can insert main categories" on public.main_categories for insert to authenticated with check (true);
create policy "Admins can update main categories" on public.main_categories for update to authenticated using (true);
create policy "Admins can delete main categories" on public.main_categories for delete to authenticated using (true);

-- Sub Categories
alter table public.sub_categories enable row level security;
create policy "Public can view sub categories" on public.sub_categories for select using (true);
create policy "Admins can insert sub categories" on public.sub_categories for insert to authenticated with check (true);
create policy "Admins can update sub categories" on public.sub_categories for update to authenticated using (true);
create policy "Admins can delete sub categories" on public.sub_categories for delete to authenticated using (true);

-- Raw Materials
alter table public.raw_materials enable row level security;
create policy "Public can view visible raw materials" on public.raw_materials for select using (is_visible = true);
create policy "Admins can view all raw materials" on public.raw_materials for select to authenticated using (true);
create policy "Admins can insert raw materials" on public.raw_materials for insert to authenticated with check (true);
create policy "Admins can update raw materials" on public.raw_materials for update to authenticated using (true);
create policy "Admins can delete raw materials" on public.raw_materials for delete to authenticated using (true);

-- Sub Category Materials
alter table public.sub_category_materials enable row level security;
create policy "Public can view material links" on public.sub_category_materials for select using (true);
create policy "Admins can insert material links" on public.sub_category_materials for insert to authenticated with check (true);
create policy "Admins can delete material links" on public.sub_category_materials for delete to authenticated using (true);

-- Store Settings
alter table public.store_settings enable row level security;

-- =============================================
-- Storage Buckets
-- =============================================

insert into storage.buckets (id, name, public) values ('products', 'products', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('materials', 'materials', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true) on conflict do nothing;
