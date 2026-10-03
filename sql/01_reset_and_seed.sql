-- Khak-e-Wathan demo seed v3.0.1
-- DESTRUCTIVE: clears ALL existing listing data from:
--   property_images, property_verifications, properties
--
-- Intentionally preserved:
--   auth.users, profiles, locations
--
-- All 15 records below are synthetic hackathon demo listings.
-- Coordinates are approximate demo points, not parcel boundaries.
-- Prices are synthetic and should not be represented as verified market rates.

begin;

-- Safety check: the existing location rows must be present.
do $$
begin
  if not exists (
    select 1 from public.locations
    where slug = 'booni' and is_active = true
  ) then
    raise exception 'Active location "booni" was not found in public.locations.';
  end if;

  if not exists (
    select 1 from public.locations
    where slug = 'balach' and is_active = true
  ) then
    raise exception 'Active location "balach" was not found in public.locations.';
  end if;
end
$$;

-- Child tables first so this works even if cascade rules differ.
delete from public.property_images;
delete from public.property_verifications;
delete from public.properties;

with seed (
  id,
  location_slug,
  title,
  description,
  property_type,
  price_pkr,
  area_value,
  area_unit,
  area_sq_ft,
  road_access,
  road_type,
  distance_to_main_road_m,
  water_available,
  water_source,
  electricity_available,
  irrigation_available,
  internet_quality,
  terrain,
  slope,
  residential_suitability,
  agricultural_suitability,
  latitude,
  longitude,
  seller_display_name,
  created_days_ago
) as (
  values
  ('demo-booni-001', 'booni', '5 Marla Residential Plot near Booni Bazaar', 'A compact residential plot in the Booni area with vehicle access, nearby utilities and mostly flat terrain. Suitable for a small home or family residence. Demo listing with representative imagery rather than an exact parcel photograph.', 'residential', 3400000, 5, 'marla', 1361.25, true, 'Paved access', 90, true, 'Local supply', true, false, 'good', 'flat', 'low', 'high', 'low', 36.274400, 72.257800, 'Khak-e-Wathan Demo', 1),
  ('demo-booni-002', 'booni', '8 Marla Family Home Plot in Central Booni', 'An 8 Marla residential plot with practical road access and strong utility availability. The mostly flat site is presented as a demo option for buyers looking for a family-home location in Booni.', 'residential', 5300000, 8, 'marla', 2178.00, true, 'Paved street', 140, true, 'Local supply', true, false, 'good', 'flat', 'low', 'high', 'low', 36.271800, 72.263100, 'Khak-e-Wathan Demo', 2),
  ('demo-booni-003', 'booni', '1 Kanal Residential Land with Mountain Views', 'A larger residential parcel on the edge of Booni with open mountain views and enough space for a house, garden and parking. Access is available by a gravel road. This is a synthetic demo listing.', 'residential', 12800000, 1, 'kanal', 5445.00, true, 'Gravel access road', 320, true, 'Spring-fed local supply', true, false, 'fair', 'mixed', 'moderate', 'high', 'moderate', 36.279100, 72.250400, 'Khak-e-Wathan Demo', 3),
  ('demo-booni-004', 'booni', '2 Kanal Irrigated Agricultural Land', 'A two-kanal agricultural demo property with irrigation access, flat workable terrain and a nearby vehicle track. Intended to demonstrate how agricultural suitability and utility information appear in Khak-e-Wathan.', 'agricultural', 22500000, 2, 'kanal', 10890.00, true, 'Farm access track', 430, true, 'Irrigation channel', true, true, 'fair', 'flat', 'low', 'moderate', 'high', 36.267200, 72.269600, 'Khak-e-Wathan Demo', 4),
  ('demo-booni-005', 'booni', '3 Kanal Orchard-Suitable Land outside Booni', 'A larger agricultural parcel designed as a demo orchard or small-farm listing. Water and irrigation are recorded, while electricity is not currently marked as available at the plot.', 'agricultural', 31000000, 3, 'kanal', 16335.00, true, 'Gravel road', 620, true, 'Seasonal channel and local supply', false, true, 'fair', 'mixed', 'moderate', 'moderate', 'high', 36.282600, 72.271800, 'Khak-e-Wathan Demo', 5),
  ('demo-booni-006', 'booni', '10 Marla Roadside Commercial Plot', 'A roadside commercial demo plot with direct paved access and recorded utility availability. Suitable for demonstrating shop, office or mixed-use search filters on the platform.', 'commercial', 7800000, 10, 'marla', 2722.50, true, 'Main paved road frontage', 25, true, 'Local supply', true, false, 'good', 'flat', 'low', 'moderate', 'low', 36.272900, 72.258900, 'Khak-e-Wathan Demo', 6),
  ('demo-booni-007', 'booni', '12 Marla Quiet Residential Plot', 'A quieter residential demo plot with enough area for a larger home and garden. Vehicle access and basic utilities are recorded, with moderate distance from the main road.', 'residential', 7100000, 12, 'marla', 3267.00, true, 'Local gravel lane', 270, true, 'Local supply', true, false, 'fair', 'mixed', 'low', 'high', 'moderate', 36.265900, 72.255100, 'Khak-e-Wathan Demo', 7),
  ('demo-booni-008', 'booni', '6 Marla Starter Plot with Utility Access', 'A smaller residential demo listing aimed at first-time buyers, with straightforward road access, electricity, water and good recorded connectivity.', 'residential', 3650000, 6, 'marla', 1633.50, true, 'Local paved lane', 180, true, 'Local supply', true, false, 'good', 'flat', 'low', 'high', 'low', 36.276100, 72.265200, 'Khak-e-Wathan Demo', 8),
  ('demo-balach-001', 'balach', '5 Marla Residential Plot in Balach', 'A compact residential demo plot in Balach with practical road access and recorded water and electricity availability. Designed for a small family home.', 'residential', 3050000, 5, 'marla', 1361.25, true, 'Paved neighborhood road', 110, true, 'Local supply', true, false, 'good', 'flat', 'low', 'high', 'low', 35.886900, 71.796100, 'Khak-e-Wathan Demo', 1.5),
  ('demo-balach-002', 'balach', '8 Marla Corner Plot with Road Access', 'An 8 Marla corner-style demo plot with strong road proximity and utilities. The listing is intended to showcase a well-connected residential option in Balach.', 'residential', 4750000, 8, 'marla', 2178.00, true, 'Paved road', 70, true, 'Local supply', true, false, 'good', 'flat', 'low', 'high', 'low', 35.884700, 71.800300, 'Khak-e-Wathan Demo', 2.5),
  ('demo-balach-003', 'balach', '1 Kanal Mixed-Terrain Residential Land', 'A one-kanal residential demo parcel with a mix of flatter and gently sloped ground. It has vehicle access and recorded utilities while remaining slightly away from the main road.', 'residential', 10900000, 1, 'kanal', 5445.00, true, 'Gravel access', 350, true, 'Local supply', true, false, 'fair', 'mixed', 'moderate', 'high', 'moderate', 35.889800, 71.801700, 'Khak-e-Wathan Demo', 3.5),
  ('demo-balach-004', 'balach', '2 Kanal Agricultural Land with Irrigation', 'A two-kanal agricultural demo listing with flat terrain, irrigation access and a nearby farm road. Electricity is intentionally left unavailable to demonstrate realistic filter differences.', 'agricultural', 19500000, 2, 'kanal', 10890.00, true, 'Farm road', 520, true, 'Irrigation channel', false, true, 'fair', 'flat', 'low', 'moderate', 'high', 35.881900, 71.793600, 'Khak-e-Wathan Demo', 4.5),
  ('demo-balach-005', 'balach', '4 Kanal Open Agricultural Parcel', 'A larger agricultural demo parcel that intentionally has weaker road access and connectivity but good agricultural suitability and irrigation. Useful for showing trade-offs in search and valuation.', 'agricultural', 35000000, 4, 'kanal', 21780.00, false, 'Foot and farm-track access', 880, true, 'Seasonal channel', false, true, 'poor', 'mixed', 'moderate', 'low', 'high', 35.892200, 71.789800, 'Khak-e-Wathan Demo', 5.5),
  ('demo-balach-006', 'balach', '7 Marla Commercial Plot near Local Road', 'A compact commercial demo plot with close road proximity, utilities and good recorded connectivity. Suitable for showcasing small-business or shop-oriented searches.', 'commercial', 4900000, 7, 'marla', 1905.75, true, 'Paved commercial access', 60, true, 'Local supply', true, false, 'good', 'flat', 'low', 'moderate', 'low', 35.887600, 71.803500, 'Khak-e-Wathan Demo', 6.5),
  ('demo-balach-007', 'balach', '15 Marla Residential Land with Open Views', 'A larger residential demo parcel with open views, vehicle access and recorded utilities. Its mixed terrain provides a different profile from the flatter Balach listings.', 'residential', 8100000, 15, 'marla', 4083.75, true, 'Gravel neighborhood road', 410, true, 'Local supply', true, false, 'fair', 'mixed', 'moderate', 'high', 'moderate', 35.883300, 71.804900, 'Khak-e-Wathan Demo', 7.5)
)
insert into public.properties (
  id,
  location_id,
  title,
  description,
  property_type,
  listing_status,
  price_pkr,
  area_value,
  area_unit,
  area_sq_ft,
  road_access,
  road_type,
  distance_to_main_road_m,
  water_available,
  water_source,
  electricity_available,
  irrigation_available,
  internet_quality,
  terrain,
  slope,
  residential_suitability,
  agricultural_suitability,
  latitude,
  longitude,
  seller_display_name,
  is_demo,
  created_at,
  updated_at
)
select
  seed.id,
  locations.id,
  seed.title,
  seed.description,
  seed.property_type,
  'active',
  seed.price_pkr,
  seed.area_value,
  seed.area_unit,
  seed.area_sq_ft,
  seed.road_access,
  seed.road_type,
  seed.distance_to_main_road_m,
  seed.water_available,
  seed.water_source,
  seed.electricity_available,
  seed.irrigation_available,
  seed.internet_quality,
  seed.terrain,
  seed.slope,
  seed.residential_suitability,
  seed.agricultural_suitability,
  seed.latitude,
  seed.longitude,
  seed.seller_display_name,
  true,
  now() - make_interval(secs => (seed.created_days_ago * 86400)::int),
  now()
from seed
join public.locations
  on locations.slug = seed.location_slug;

insert into public.property_verifications (
  property_id,
  seller_identity,
  property_location,
  photos,
  ownership_evidence,
  physical_inspection
)
values
  ('demo-booni-001', 'verified', 'verified', 'verified', 'verified', 'verified'),
  ('demo-booni-002', 'verified', 'verified', 'verified', 'pending', 'pending'),
  ('demo-booni-003', 'verified', 'verified', 'verified', 'verified', 'pending'),
  ('demo-booni-004', 'verified', 'verified', 'verified', 'pending', 'not_checked'),
  ('demo-booni-005', 'verified', 'pending', 'verified', 'not_checked', 'not_checked'),
  ('demo-booni-006', 'verified', 'verified', 'verified', 'verified', 'not_checked'),
  ('demo-booni-007', 'verified', 'verified', 'pending', 'pending', 'not_checked'),
  ('demo-booni-008', 'verified', 'pending', 'verified', 'not_checked', 'not_checked'),
  ('demo-balach-001', 'verified', 'verified', 'verified', 'verified', 'pending'),
  ('demo-balach-002', 'verified', 'verified', 'verified', 'verified', 'verified'),
  ('demo-balach-003', 'verified', 'verified', 'pending', 'verified', 'not_checked'),
  ('demo-balach-004', 'verified', 'verified', 'verified', 'pending', 'not_checked'),
  ('demo-balach-005', 'pending', 'verified', 'verified', 'not_checked', 'not_checked'),
  ('demo-balach-006', 'verified', 'verified', 'verified', 'pending', 'pending'),
  ('demo-balach-007', 'verified', 'pending', 'verified', 'verified', 'not_checked');

commit;

-- Expected after this SQL:
-- 15 active properties
-- 15 verification rows
-- 0 image metadata rows until the storage upload script is run.
