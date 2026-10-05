-- Khak-e-Wathan realistic demo seed v4
-- DESTRUCTIVE DEMO RESET:
-- Replaces all property listings, property images, verifications and inquiries.
-- Preserves auth.users, profiles and locations.
--
-- All 20 listings, prices, coordinates, verification states and images are
-- synthetic hackathon demo data.
-- The property images are AI-generated representative visuals, not photographs
-- of actual listed parcels or buildings.

begin;

do $$
begin
  if not exists (
    select 1 from public.locations
    where slug='booni' and is_active=true
  ) then
    raise exception 'Active location "booni" was not found.';
  end if;

  if not exists (
    select 1 from public.locations
    where slug='balach' and is_active=true
  ) then
    raise exception 'Active location "balach" was not found.';
  end if;
end
$$;

delete from public.property_inquiries;
delete from public.property_images;
delete from public.property_verifications;
delete from public.properties;

with seed (
  id, location_slug, title, description, property_type, price_pkr,
  area_value, area_unit, area_sq_ft, road_access, road_type,
  distance_to_main_road_m, water_available, water_source,
  electricity_available, irrigation_available, internet_quality,
  terrain, slope, residential_suitability, agricultural_suitability,
  latitude, longitude, seller_display_name, created_days_ago
) as (
  values
  ('demo-booni-001', 'booni', 'Traditional 7 Marla Courtyard Home in Booni', 'A traditional-style residential home with stone boundary walls, a small courtyard and mature trees. The listing is designed to demonstrate how an existing home can be presented with road, utility and verification information. Synthetic hackathon listing; the image is an AI-generated representative visual, not a photograph of an actual property.', 'residential', 9800000, 7, 'marla', 1905.75, true, 'Local paved lane', 90, true, 'Local supply', true, false, 'good', 'flat', 'low', 'high', 'low', 36.274400, 72.257800, 'Khak-e-Wathan Demo', 1),
  ('demo-booni-002', 'booni', 'Stone-and-Timber Family Home on a Quiet Lane', 'A family-sized home in a quieter residential lane, with traditional stonework, timber details and enclosed outdoor space. Vehicle access and basic utilities are recorded. Synthetic hackathon listing with an AI-generated representative visual.', 'residential', 7600000, 8, 'marla', 2178.0, true, 'Local paved lane', 180, true, 'Local supply', true, false, 'good', 'flat', 'low', 'high', 'low', 36.271900, 72.263000, 'Khak-e-Wathan Demo', 2),
  ('demo-booni-003', 'booni', 'Roadside General Store with Upper Residence', 'A compact mixed-use commercial property with direct road frontage, a ground-floor shop and residential space above. Suitable for demonstrating small-business and mixed-use searches. Synthetic hackathon listing with an AI-generated representative visual.', 'commercial', 8400000, 9, 'marla', 2450.25, true, 'Main paved road frontage', 10, true, 'Local supply', true, false, 'good', 'flat', 'low', 'moderate', 'low', 36.273100, 72.259200, 'Khak-e-Wathan Demo', 3),
  ('demo-booni-004', 'booni', '9 Marla Walled Residential Plot near Central Booni', 'A walled residential plot with straightforward vehicle access and nearby houses. Water and electricity are recorded as available nearby. Synthetic hackathon listing; the image is an AI-generated representative visual rather than an exact parcel photograph.', 'residential', 5600000, 9, 'marla', 2450.25, true, 'Local access road', 120, true, 'Local supply', true, false, 'good', 'flat', 'low', 'high', 'low', 36.276000, 72.264600, 'Khak-e-Wathan Demo', 4),
  ('demo-booni-005', 'booni', '2 Kanal Irrigated Vegetable Land with Farm Shelter', 'A productive agricultural demo parcel with an irrigation channel, cultivated sections and a small farm shelter. Vehicle access is available by a local farm track. Synthetic hackathon listing with an AI-generated representative visual.', 'agricultural', 21500000, 2, 'kanal', 10890.0, true, 'Farm access track', 420, true, 'Irrigation channel', true, true, 'fair', 'flat', 'low', 'moderate', 'high', 36.267000, 72.269500, 'Khak-e-Wathan Demo', 5),
  ('demo-booni-006', 'booni', '3 Kanal Orchard and Homestead Parcel', 'A larger orchard-style parcel with mature trees, cultivable ground and a small traditional structure. Irrigation and seasonal water are recorded. Synthetic hackathon listing with an AI-generated representative visual.', 'agricultural', 30000000, 3, 'kanal', 16335.0, true, 'Gravel access road', 610, true, 'Seasonal channel and local supply', false, true, 'fair', 'mixed', 'moderate', 'moderate', 'high', 36.282400, 72.271500, 'Khak-e-Wathan Demo', 6),
  ('demo-booni-007', 'booni', 'Traditional Two-Storey Courtyard House', 'A larger traditional-style residence arranged around a courtyard with timber balconies and garden space. Intended to demonstrate an established-home listing rather than only vacant land. Synthetic hackathon listing with an AI-generated representative visual.', 'residential', 15200000, 1, 'kanal', 5445.0, true, 'Local gravel lane', 240, true, 'Local supply', true, false, 'fair', 'mixed', 'low', 'high', 'moderate', 36.279000, 72.250600, 'Khak-e-Wathan Demo', 7),
  ('demo-booni-008', 'booni', 'Main-Road Commercial Shopfront in Booni', 'A roadside commercial property with visible shop frontage and direct access from a paved road. Suitable for retail, office or mixed-use discovery scenarios. Synthetic hackathon listing with an AI-generated representative visual.', 'commercial', 9200000, 8, 'marla', 2178.0, true, 'Main paved road frontage', 5, true, 'Local supply', true, false, 'good', 'flat', 'low', 'moderate', 'low', 36.272500, 72.260100, 'Khak-e-Wathan Demo', 8),
  ('demo-booni-009', 'booni', '10 Marla Walled Garden Plot with Mountain Outlook', 'A residential plot enclosed by a boundary wall with mature trees and open mountain views. Basic utilities and vehicle access are recorded. Synthetic hackathon listing; the image is an AI-generated representative visual.', 'residential', 6800000, 10, 'marla', 2722.5, true, 'Paved neighborhood road', 160, true, 'Local supply', true, false, 'good', 'flat', 'low', 'high', 'moderate', 36.265800, 72.255000, 'Khak-e-Wathan Demo', 9),
  ('demo-booni-010', 'booni', '1 Kanal Village Home with Courtyard and Garden', 'A larger home-style listing with multiple rooms, enclosed courtyard space and a small garden. Designed to demonstrate a complete residential property profile with more than vacant land. Synthetic hackathon listing with AI-generated representative imagery.', 'residential', 11900000, 1, 'kanal', 5445.0, true, 'Local access lane', 210, true, 'Local supply', true, false, 'fair', 'mixed', 'low', 'high', 'moderate', 36.277200, 72.266000, 'Khak-e-Wathan Demo', 10),
  ('demo-balach-001', 'balach', 'Traditional Stone Home with Mountain Outlook', 'A traditional stone-and-timber residential home with enclosed outdoor space and mountain outlook. Road access, water and electricity are recorded. Synthetic hackathon listing with an AI-generated representative visual.', 'residential', 8100000, 8, 'marla', 2178.0, true, 'Local neighborhood road', 130, true, 'Local supply', true, false, 'good', 'flat', 'low', 'high', 'low', 35.886900, 71.796100, 'Khak-e-Wathan Demo', 1.5),
  ('demo-balach-002', 'balach', 'Local Market Shop Unit with Road Frontage', 'A small commercial shop property facing a local market road, with strong pedestrian and vehicle access. Designed for shop-oriented property discovery. Synthetic hackathon listing with an AI-generated representative visual.', 'commercial', 5500000, 6, 'marla', 1633.5, true, 'Paved market road', 5, true, 'Local supply', true, false, 'good', 'flat', 'low', 'moderate', 'low', 35.884800, 71.800200, 'Khak-e-Wathan Demo', 2.5),
  ('demo-balach-003', 'balach', '8 Marla Residential Plot in a Stone-Walled Neighborhood', 'A compact residential plot within an established neighborhood of boundary walls and family homes. Road access and nearby utilities are recorded. Synthetic hackathon listing; the image is an AI-generated representative visual.', 'residential', 4600000, 8, 'marla', 2178.0, true, 'Neighborhood access road', 150, true, 'Local supply', true, false, 'fair', 'flat', 'low', 'high', 'low', 35.889700, 71.801700, 'Khak-e-Wathan Demo', 3.5),
  ('demo-balach-004', 'balach', '2 Kanal Irrigated Field with Traditional Farmhouse', 'An agricultural parcel with cultivated fields, a working irrigation channel and a small traditional farmhouse-style structure. Synthetic hackathon listing with an AI-generated representative visual.', 'agricultural', 18800000, 2, 'kanal', 10890.0, true, 'Farm access road', 500, true, 'Irrigation channel', false, true, 'fair', 'flat', 'low', 'moderate', 'high', 35.881800, 71.793500, 'Khak-e-Wathan Demo', 4.5),
  ('demo-balach-005', 'balach', 'Restored Courtyard Home with Timber Detailing', 'A courtyard-style residence with traditional timber details, stonework and enclosed family space. Intended to demonstrate a higher-value established home in the marketplace. Synthetic hackathon listing with an AI-generated representative visual.', 'residential', 13500000, 1, 'kanal', 5445.0, true, 'Local paved lane', 190, true, 'Local supply', true, false, 'good', 'flat', 'low', 'high', 'moderate', 35.892000, 71.789900, 'Khak-e-Wathan Demo', 5.5),
  ('demo-balach-006', 'balach', 'Roadside Shop with Upper-Floor Residence', 'A mixed-use commercial building with a ground-floor shop and residential space above, positioned directly on a local paved road. Synthetic hackathon listing with an AI-generated representative visual.', 'commercial', 7200000, 7, 'marla', 1905.75, true, 'Paved commercial road', 5, true, 'Local supply', true, false, 'good', 'flat', 'low', 'moderate', 'low', 35.887600, 71.803400, 'Khak-e-Wathan Demo', 6.5),
  ('demo-balach-007', 'balach', '12 Marla Walled Garden Plot with Vehicle Gate', 'A residential plot enclosed by a boundary wall with a vehicle gate and established greenery. Utilities and road access are recorded. Synthetic hackathon listing; the image is an AI-generated representative visual.', 'residential', 6200000, 12, 'marla', 3267.0, true, 'Local paved road', 100, true, 'Local supply', true, false, 'good', 'flat', 'low', 'high', 'moderate', 35.883400, 71.804800, 'Khak-e-Wathan Demo', 7.5),
  ('demo-balach-008', 'balach', '3 Kanal Orchard with Small Stone House', 'An orchard-style agricultural property with flowering fruit trees, cultivable ground and a small stone house. Irrigation access is recorded. Synthetic hackathon listing with an AI-generated representative visual.', 'agricultural', 28000000, 3, 'kanal', 16335.0, true, 'Gravel farm road', 650, true, 'Seasonal irrigation channel', true, true, 'fair', 'mixed', 'moderate', 'moderate', 'high', 35.891000, 71.798000, 'Khak-e-Wathan Demo', 8.5),
  ('demo-balach-009', 'balach', 'Traditional Guesthouse-Style Courtyard Property', 'A larger residential property with a landscaped courtyard, timber balconies and multiple rooms, presented as a guesthouse-style or extended-family option. Synthetic hackathon listing with an AI-generated representative visual.', 'residential', 16500000, 1.5, 'kanal', 8167.5, true, 'Local access road', 260, true, 'Local supply', true, false, 'fair', 'mixed', 'low', 'high', 'moderate', 35.885500, 71.806100, 'Khak-e-Wathan Demo', 9.5),
  ('demo-balach-010', 'balach', '1 Kanal Residential Plot with Open Valley Views', 'A one-kanal residential parcel with open valley views and nearby established homes. Vehicle access and basic utilities are recorded. Synthetic hackathon listing; the image is an AI-generated representative visual.', 'residential', 10400000, 1, 'kanal', 5445.0, true, 'Gravel neighborhood road', 330, true, 'Local supply', true, false, 'fair', 'mixed', 'moderate', 'high', 'moderate', 35.880700, 71.799500, 'Khak-e-Wathan Demo', 10.5)
)
insert into public.properties (
  id, location_id, title, description, property_type, listing_status,
  price_pkr, area_value, area_unit, area_sq_ft, road_access, road_type,
  distance_to_main_road_m, water_available, water_source,
  electricity_available, irrigation_available, internet_quality,
  terrain, slope, residential_suitability, agricultural_suitability,
  latitude, longitude, seller_display_name, is_demo, created_at, updated_at
)
select
  seed.id, locations.id, seed.title, seed.description, seed.property_type,
  'active', seed.price_pkr, seed.area_value, seed.area_unit, seed.area_sq_ft,
  seed.road_access, seed.road_type, seed.distance_to_main_road_m,
  seed.water_available, seed.water_source, seed.electricity_available,
  seed.irrigation_available, seed.internet_quality, seed.terrain, seed.slope,
  seed.residential_suitability, seed.agricultural_suitability,
  seed.latitude, seed.longitude, seed.seller_display_name, true,
  now() - make_interval(secs => (seed.created_days_ago * 86400)::int),
  now()
from seed
join public.locations on locations.slug=seed.location_slug;

insert into public.property_verifications (
  property_id, seller_identity, property_location, photos,
  ownership_evidence, physical_inspection
)
values
  ('demo-booni-001', 'verified', 'verified', 'verified', 'verified', 'verified'),
  ('demo-booni-002', 'verified', 'verified', 'verified', 'pending', 'not_checked'),
  ('demo-booni-003', 'verified', 'verified', 'verified', 'verified', 'pending'),
  ('demo-booni-004', 'verified', 'verified', 'verified', 'pending', 'not_checked'),
  ('demo-booni-005', 'verified', 'verified', 'verified', 'verified', 'verified'),
  ('demo-booni-006', 'verified', 'verified', 'verified', 'verified', 'pending'),
  ('demo-booni-007', 'verified', 'verified', 'verified', 'pending', 'pending'),
  ('demo-booni-008', 'verified', 'verified', 'verified', 'pending', 'not_checked'),
  ('demo-booni-009', 'verified', 'verified', 'verified', 'verified', 'pending'),
  ('demo-booni-010', 'verified', 'verified', 'verified', 'pending', 'not_checked'),
  ('demo-balach-001', 'verified', 'verified', 'verified', 'verified', 'verified'),
  ('demo-balach-002', 'verified', 'verified', 'verified', 'verified', 'pending'),
  ('demo-balach-003', 'verified', 'verified', 'verified', 'pending', 'pending'),
  ('demo-balach-004', 'verified', 'verified', 'verified', 'pending', 'not_checked'),
  ('demo-balach-005', 'verified', 'verified', 'verified', 'verified', 'verified'),
  ('demo-balach-006', 'verified', 'verified', 'verified', 'pending', 'not_checked'),
  ('demo-balach-007', 'verified', 'verified', 'verified', 'pending', 'pending'),
  ('demo-balach-008', 'verified', 'verified', 'verified', 'verified', 'pending'),
  ('demo-balach-009', 'verified', 'verified', 'verified', 'verified', 'verified'),
  ('demo-balach-010', 'verified', 'verified', 'verified', 'pending', 'not_checked');

update public.property_verifications
set
  seller_identity_note='Demo identity evidence was reviewed.',
  property_location_note='The submitted demo area and map point were reviewed.',
  photos_note='The AI-generated representative demo visual was reviewed.',
  ownership_evidence_note=
    case ownership_evidence
      when 'verified' then 'Demo ownership evidence was recorded as reviewed.'
      when 'pending' then 'Ownership evidence needs further review.'
      else null
    end,
  physical_inspection_note=
    case physical_inspection
      when 'verified' then 'A demo inspection record was marked complete.'
      when 'pending' then 'Physical inspection is still pending.'
      else null
    end,
  reviewer_display_name='Khak-e-Wathan demo review team',
  reviewed_at=now(),
  updated_at=now()
where property_id like 'demo-%';

commit;

-- Expected after this SQL:
-- 20 active properties
-- 20 verification rows
-- 0 image rows until scripts/upload-demo-images.mjs is run.
