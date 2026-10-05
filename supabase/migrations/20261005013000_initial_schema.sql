-- Khak-e-Wathan reproducible Supabase schema
-- Safe to apply to a fresh project or the existing hackathon project.

begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.locations (
  name,
  slug,
  display_order,
  is_active
)
values
  ('Booni', 'booni', 10, true),
  ('Balach', 'balach', 20, true),
  ('Chitral City', 'chitral-city', 30, true),
  ('Drosh', 'drosh', 40, true),
  ('Mastuj', 'mastuj', 50, true),
  ('Reshun', 'reshun', 60, true)
on conflict (slug) do update
set
  name = excluded.name,
  display_order = excluded.display_order;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'seller'
    check (role in ('seller', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id text primary key,
  seller_id uuid references auth.users(id) on delete set null,
  location_id uuid not null references public.locations(id),
  title text not null check (char_length(title) between 3 and 140),
  description text not null check (char_length(description) between 10 and 5000),
  property_type text not null
    check (property_type in ('residential', 'agricultural', 'commercial')),
  listing_status text not null default 'draft'
    check (listing_status in ('draft', 'pending_review', 'active', 'rejected', 'sold', 'archived')),
  price_pkr bigint not null check (price_pkr > 0),
  area_value numeric(14, 2) not null check (area_value > 0),
  area_unit text not null check (area_unit in ('marla', 'kanal', 'sq_ft')),
  area_sq_ft numeric(16, 2),
  road_access boolean not null default false,
  road_type text,
  distance_to_main_road_m integer check (distance_to_main_road_m >= 0),
  water_available boolean not null default false,
  water_source text,
  electricity_available boolean not null default false,
  irrigation_available boolean not null default false,
  internet_quality text check (internet_quality in ('poor', 'fair', 'good')),
  terrain text check (terrain in ('flat', 'mixed', 'sloped')),
  slope text check (slope in ('low', 'moderate', 'steep')),
  residential_suitability text
    check (residential_suitability in ('low', 'moderate', 'high')),
  agricultural_suitability text
    check (agricultural_suitability in ('low', 'moderate', 'high')),
  latitude numeric(9, 6) check (latitude between -90 and 90),
  longitude numeric(9, 6) check (longitude between -180 and 180),
  seller_display_name text,
  review_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.properties
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists is_demo boolean not null default false;

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references public.properties(id) on delete cascade,
  storage_path text not null unique,
  alt_text text,
  display_order integer not null default 0 check (display_order >= 0),
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.property_verifications (
  property_id text primary key references public.properties(id) on delete cascade,
  seller_identity text not null default 'not_checked'
    check (seller_identity in ('not_checked', 'pending', 'verified')),
  property_location text not null default 'not_checked'
    check (property_location in ('not_checked', 'pending', 'verified')),
  photos text not null default 'not_checked'
    check (photos in ('not_checked', 'pending', 'verified')),
  ownership_evidence text not null default 'not_checked'
    check (ownership_evidence in ('not_checked', 'pending', 'verified')),
  physical_inspection text not null default 'not_checked'
    check (physical_inspection in ('not_checked', 'pending', 'verified')),
  seller_identity_note text,
  property_location_note text,
  photos_note text,
  ownership_evidence_note text,
  physical_inspection_note text,
  reviewer_id uuid references auth.users(id) on delete set null,
  reviewer_display_name text,
  reviewed_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.property_verifications
  add column if not exists seller_identity_note text,
  add column if not exists property_location_note text,
  add column if not exists photos_note text,
  add column if not exists ownership_evidence_note text,
  add column if not exists physical_inspection_note text,
  add column if not exists reviewer_id uuid references auth.users(id) on delete set null,
  add column if not exists reviewer_display_name text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.property_inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references public.properties(id) on delete cascade,
  buyer_name text not null check (char_length(buyer_name) between 2 and 80),
  buyer_phone text,
  buyer_email text,
  message text not null check (char_length(message) between 5 and 1000),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    nullif(btrim(coalesce(buyer_phone, '')), '') is not null
    or nullif(btrim(coalesce(buyer_email, '')), '') is not null
  )
);

create index if not exists properties_status_created_idx
  on public.properties (listing_status, created_at desc);

create index if not exists properties_seller_created_idx
  on public.properties (seller_id, created_at desc);

create index if not exists properties_location_idx
  on public.properties (location_id);

create index if not exists property_images_property_order_idx
  on public.property_images (property_id, display_order);

create index if not exists property_inquiries_property_created_idx
  on public.property_inquiries (property_id, created_at desc);

drop trigger if exists locations_set_updated_at on public.locations;
create trigger locations_set_updated_at
before update on public.locations
for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
before update on public.properties
for each row execute function public.set_updated_at();

drop trigger if exists property_verifications_set_updated_at on public.property_verifications;
create trigger property_verifications_set_updated_at
before update on public.property_verifications
for each row execute function public.set_updated_at();

drop trigger if exists property_inquiries_set_updated_at on public.property_inquiries;
create trigger property_inquiries_set_updated_at
before update on public.property_inquiries
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name
  )
  values (
    new.id,
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '')
  )
  on conflict (id) do update
  set full_name = coalesce(
    excluded.full_name,
    public.profiles.full_name
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of raw_user_meta_data on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.locations enable row level security;
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.property_verifications enable row level security;
alter table public.property_inquiries enable row level security;

drop policy if exists locations_read on public.locations;
create policy locations_read
on public.locations
for select
using (is_active or public.is_admin());

drop policy if exists profiles_read on public.profiles;
create policy profiles_read
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = 'seller'
);

drop policy if exists properties_read on public.properties;
create policy properties_read
on public.properties
for select
using (
  listing_status = 'active'
  or seller_id = auth.uid()
  or public.is_admin()
);

drop policy if exists properties_insert_own on public.properties;
create policy properties_insert_own
on public.properties
for insert
to authenticated
with check (
  seller_id = auth.uid()
  and listing_status = 'draft'
);

drop policy if exists properties_update_own_editable on public.properties;
create policy properties_update_own_editable
on public.properties
for update
to authenticated
using (
  public.is_admin()
  or (
    seller_id = auth.uid()
    and listing_status in ('draft', 'rejected')
  )
)
with check (
  public.is_admin()
  or (
    seller_id = auth.uid()
    and listing_status in ('draft', 'rejected')
  )
);

drop policy if exists properties_delete_own_draft on public.properties;
create policy properties_delete_own_draft
on public.properties
for delete
to authenticated
using (
  public.is_admin()
  or (
    seller_id = auth.uid()
    and listing_status = 'draft'
  )
);

drop policy if exists property_images_read on public.property_images;
create policy property_images_read
on public.property_images
for select
using (
  exists (
    select 1
    from public.properties
    where properties.id = property_images.property_id
      and (
        properties.listing_status = 'active'
        or properties.seller_id = auth.uid()
        or public.is_admin()
      )
  )
);

drop policy if exists property_images_insert on public.property_images;
create policy property_images_insert
on public.property_images
for insert
to authenticated
with check (
  exists (
    select 1
    from public.properties
    where properties.id = property_images.property_id
      and (
        public.is_admin()
        or (
          properties.seller_id = auth.uid()
          and properties.listing_status in ('draft', 'rejected')
        )
      )
  )
);

drop policy if exists property_images_update on public.property_images;
create policy property_images_update
on public.property_images
for update
to authenticated
using (
  exists (
    select 1
    from public.properties
    where properties.id = property_images.property_id
      and (
        public.is_admin()
        or (
          properties.seller_id = auth.uid()
          and properties.listing_status in ('draft', 'rejected')
        )
      )
  )
);

drop policy if exists property_images_delete on public.property_images;
create policy property_images_delete
on public.property_images
for delete
to authenticated
using (
  exists (
    select 1
    from public.properties
    where properties.id = property_images.property_id
      and (
        public.is_admin()
        or (
          properties.seller_id = auth.uid()
          and properties.listing_status in ('draft', 'rejected')
        )
      )
  )
);

drop policy if exists property_verifications_read on public.property_verifications;
create policy property_verifications_read
on public.property_verifications
for select
using (
  exists (
    select 1
    from public.properties
    where properties.id = property_verifications.property_id
      and (
        properties.listing_status = 'active'
        or properties.seller_id = auth.uid()
        or public.is_admin()
      )
  )
);

drop policy if exists property_verifications_admin_write on public.property_verifications;
create policy property_verifications_admin_write
on public.property_verifications
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists property_inquiries_seller_read on public.property_inquiries;
create policy property_inquiries_seller_read
on public.property_inquiries
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.properties
    where properties.id = property_inquiries.property_id
      and properties.seller_id = auth.uid()
  )
);

drop policy if exists property_inquiries_seller_update on public.property_inquiries;
create policy property_inquiries_seller_update
on public.property_inquiries
for update
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.properties
    where properties.id = property_inquiries.property_id
      and properties.seller_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.properties
    where properties.id = property_inquiries.property_id
      and properties.seller_id = auth.uid()
  )
);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'property-images',
  'property-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists property_images_storage_read on storage.objects;
create policy property_images_storage_read
on storage.objects
for select
using (bucket_id = 'property-images');

drop policy if exists property_images_storage_insert on storage.objects;
create policy property_images_storage_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'property-images'
  and (
    public.is_admin()
    or (
      split_part(name, '/', 1) = auth.uid()::text
      and exists (
        select 1
        from public.properties
        where properties.id = split_part(name, '/', 2)
          and properties.seller_id = auth.uid()
          and properties.listing_status in ('draft', 'rejected')
      )
    )
  )
);

drop policy if exists property_images_storage_update on storage.objects;
create policy property_images_storage_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'property-images'
  and (
    public.is_admin()
    or split_part(name, '/', 1) = auth.uid()::text
  )
)
with check (
  bucket_id = 'property-images'
  and (
    public.is_admin()
    or split_part(name, '/', 1) = auth.uid()::text
  )
);

drop policy if exists property_images_storage_delete on storage.objects;
create policy property_images_storage_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'property-images'
  and (
    public.is_admin()
    or split_part(name, '/', 1) = auth.uid()::text
  )
);

create or replace function public.seller_submit_property_for_review(
  p_property_id text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_property public.properties%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  select *
  into v_property
  from public.properties
  where id = p_property_id
    and seller_id = auth.uid()
  for update;

  if not found then
    raise exception 'Property not found.';
  end if;

  if v_property.listing_status not in ('draft', 'rejected') then
    raise exception 'This listing cannot be submitted in its current state.';
  end if;

  if not exists (
    select 1
    from public.property_images
    where property_id = p_property_id
  ) then
    raise exception 'Add at least one property photo before submitting.';
  end if;

  insert into public.property_verifications (
    property_id
  )
  values (
    p_property_id
  )
  on conflict (property_id) do nothing;

  update public.properties
  set
    listing_status = 'pending_review',
    review_notes = null,
    reviewed_by = null,
    reviewed_at = null
  where id = p_property_id;

  return true;
end;
$$;

create or replace function public.seller_set_primary_property_image(
  p_property_id text,
  p_image_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.properties
    where id = p_property_id
      and seller_id = auth.uid()
      and listing_status in ('draft', 'rejected')
  ) then
    raise exception 'This listing cannot be edited.';
  end if;

  if not exists (
    select 1
    from public.property_images
    where id = p_image_id
      and property_id = p_property_id
  ) then
    raise exception 'Property photo not found.';
  end if;

  update public.property_images
  set is_primary = (
    id = p_image_id
  )
  where property_id = p_property_id;

  return true;
end;
$$;

create or replace function public.seller_update_property_status(
  p_property_id text,
  p_status text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_status text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if p_status not in ('active', 'sold', 'archived') then
    raise exception 'Invalid listing status.';
  end if;

  select listing_status
  into v_current_status
  from public.properties
  where id = p_property_id
    and seller_id = auth.uid()
  for update;

  if not found then
    raise exception 'Property not found.';
  end if;

  if not (
    (
      v_current_status = 'active'
      and p_status in ('sold', 'archived')
    )
    or (
      v_current_status in ('sold', 'archived')
      and p_status = 'active'
    )
  ) then
    raise exception 'This listing status change is not allowed.';
  end if;

  update public.properties
  set listing_status = p_status
  where id = p_property_id;

  return true;
end;
$$;

create or replace function public.admin_review_property(
  p_property_id text,
  p_decision text,
  p_review_notes text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_verification public.property_verifications%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required.';
  end if;

  if p_decision not in ('approve', 'reject') then
    raise exception 'Invalid review decision.';
  end if;

  if not exists (
    select 1
    from public.properties
    where id = p_property_id
      and listing_status = 'pending_review'
  ) then
    raise exception 'This property is not awaiting review.';
  end if;

  if p_decision = 'approve' then
    select *
    into v_verification
    from public.property_verifications
    where property_id = p_property_id;

    if not found
      or v_verification.seller_identity <> 'verified'
      or v_verification.property_location <> 'verified'
      or v_verification.photos <> 'verified'
    then
      raise exception 'Verify seller identity, property location, and photos before publishing.';
    end if;

    update public.properties
    set
      listing_status = 'active',
      review_notes = null,
      reviewed_by = auth.uid(),
      reviewed_at = now()
    where id = p_property_id;
  else
    if char_length(btrim(coalesce(p_review_notes, ''))) < 5 then
      raise exception 'Provide a clear reason before returning the listing.';
    end if;

    update public.properties
    set
      listing_status = 'rejected',
      review_notes = btrim(p_review_notes),
      reviewed_by = auth.uid(),
      reviewed_at = now()
    where id = p_property_id;
  end if;

  return true;
end;
$$;

drop function if exists public.admin_update_property_verification(
  text,
  text,
  text,
  text,
  text,
  text
);

create or replace function public.admin_update_property_verification(
  p_property_id text,
  p_seller_identity text,
  p_property_location text,
  p_photos text,
  p_ownership_evidence text,
  p_physical_inspection text,
  p_seller_identity_note text default null,
  p_property_location_note text default null,
  p_photos_note text default null,
  p_ownership_evidence_note text default null,
  p_physical_inspection_note text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reviewer_name text;
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required.';
  end if;

  if not exists (
    select 1
    from public.properties
    where id = p_property_id
  ) then
    raise exception 'Property not found.';
  end if;

  if p_seller_identity not in ('not_checked', 'pending', 'verified')
    or p_property_location not in ('not_checked', 'pending', 'verified')
    or p_photos not in ('not_checked', 'pending', 'verified')
    or p_ownership_evidence not in ('not_checked', 'pending', 'verified')
    or p_physical_inspection not in ('not_checked', 'pending', 'verified')
  then
    raise exception 'Invalid verification status.';
  end if;

  if (
    p_seller_identity = 'verified'
    and char_length(btrim(coalesce(p_seller_identity_note, ''))) < 5
  ) then
    raise exception 'Add an evidence note for seller identity.';
  end if;

  if (
    p_property_location = 'verified'
    and char_length(btrim(coalesce(p_property_location_note, ''))) < 5
  ) then
    raise exception 'Add an evidence note for property location.';
  end if;

  if (
    p_photos = 'verified'
    and char_length(btrim(coalesce(p_photos_note, ''))) < 5
  ) then
    raise exception 'Add an evidence note for photos.';
  end if;

  if (
    p_ownership_evidence = 'verified'
    and char_length(btrim(coalesce(p_ownership_evidence_note, ''))) < 5
  ) then
    raise exception 'Add an evidence note for ownership evidence.';
  end if;

  if (
    p_physical_inspection = 'verified'
    and char_length(btrim(coalesce(p_physical_inspection_note, ''))) < 5
  ) then
    raise exception 'Add an evidence note for physical inspection.';
  end if;

  select coalesce(
    nullif(btrim(full_name), ''),
    'Khak-e-Wathan administrator'
  )
  into v_reviewer_name
  from public.profiles
  where id = auth.uid();

  insert into public.property_verifications (
    property_id,
    seller_identity,
    property_location,
    photos,
    ownership_evidence,
    physical_inspection,
    seller_identity_note,
    property_location_note,
    photos_note,
    ownership_evidence_note,
    physical_inspection_note,
    reviewer_id,
    reviewer_display_name,
    reviewed_at
  )
  values (
    p_property_id,
    p_seller_identity,
    p_property_location,
    p_photos,
    p_ownership_evidence,
    p_physical_inspection,
    nullif(btrim(p_seller_identity_note), ''),
    nullif(btrim(p_property_location_note), ''),
    nullif(btrim(p_photos_note), ''),
    nullif(btrim(p_ownership_evidence_note), ''),
    nullif(btrim(p_physical_inspection_note), ''),
    auth.uid(),
    coalesce(v_reviewer_name, 'Khak-e-Wathan administrator'),
    now()
  )
  on conflict (property_id) do update
  set
    seller_identity = excluded.seller_identity,
    property_location = excluded.property_location,
    photos = excluded.photos,
    ownership_evidence = excluded.ownership_evidence,
    physical_inspection = excluded.physical_inspection,
    seller_identity_note = excluded.seller_identity_note,
    property_location_note = excluded.property_location_note,
    photos_note = excluded.photos_note,
    ownership_evidence_note = excluded.ownership_evidence_note,
    physical_inspection_note = excluded.physical_inspection_note,
    reviewer_id = excluded.reviewer_id,
    reviewer_display_name = excluded.reviewer_display_name,
    reviewed_at = excluded.reviewed_at;

  return true;
end;
$$;

create or replace function public.create_property_inquiry(
  p_property_id text,
  p_buyer_name text,
  p_buyer_phone text default null,
  p_buyer_email text default null,
  p_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inquiry_id uuid;
  v_name text := btrim(coalesce(p_buyer_name, ''));
  v_phone text := nullif(btrim(coalesce(p_buyer_phone, '')), '');
  v_email text := nullif(lower(btrim(coalesce(p_buyer_email, ''))), '');
  v_message text := btrim(coalesce(p_message, ''));
begin
  if not exists (
    select 1
    from public.properties
    where id = p_property_id
      and listing_status = 'active'
  ) then
    raise exception 'This property is not available for inquiries.';
  end if;

  if char_length(v_name) not between 2 and 80 then
    raise exception 'Enter your name.';
  end if;

  if v_phone is null and v_email is null then
    raise exception 'Provide a phone number or email address.';
  end if;

  if v_email is not null
    and v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  then
    raise exception 'Enter a valid email address.';
  end if;

  if char_length(v_message) not between 5 and 1000 then
    raise exception 'Add a short message for the seller.';
  end if;

  insert into public.property_inquiries (
    property_id,
    buyer_name,
    buyer_phone,
    buyer_email,
    message
  )
  values (
    p_property_id,
    v_name,
    v_phone,
    v_email,
    v_message
  )
  returning id into v_inquiry_id;

  return v_inquiry_id;
end;
$$;

grant usage on schema public to anon, authenticated;

grant select on public.locations to anon, authenticated;
grant select on public.properties to anon, authenticated;
grant select on public.property_images to anon, authenticated;
grant select on public.property_verifications to anon, authenticated;

grant select, update on public.profiles to authenticated;
grant insert, update, delete on public.properties to authenticated;
grant insert, update, delete on public.property_images to authenticated;
revoke update on public.property_inquiries from authenticated;
grant select on public.property_inquiries to authenticated;
grant update (status) on public.property_inquiries to authenticated;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.seller_submit_property_for_review(text) to authenticated;
grant execute on function public.seller_set_primary_property_image(text, uuid) to authenticated;
grant execute on function public.seller_update_property_status(text, text) to authenticated;
grant execute on function public.admin_review_property(text, text, text) to authenticated;
grant execute on function public.admin_update_property_verification(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;
grant execute on function public.create_property_inquiry(
  text,
  text,
  text,
  text,
  text
) to anon, authenticated;

commit;
