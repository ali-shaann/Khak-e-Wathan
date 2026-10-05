-- Khak-e-Wathan demo seed verification

select
  count(*) as active_property_count
from public.properties
where listing_status = 'active';

select
  l.slug as location,
  p.property_type,
  count(*) as listings
from public.properties p
join public.locations l on l.id = p.location_id
where p.listing_status = 'active'
group by l.slug, p.property_type
order by l.slug, p.property_type;

select
  p.id,
  p.title,
  l.name as location,
  p.property_type,
  p.price_pkr,
  p.area_value,
  p.area_unit,
  pv.seller_identity,
  pv.property_location,
  pv.photos,
  pv.ownership_evidence,
  pv.physical_inspection,
  pv.reviewer_display_name,
  pv.reviewed_at,
  count(pi.id) as image_count
from public.properties p
join public.locations l on l.id = p.location_id
left join public.property_verifications pv on pv.property_id = p.id
left join public.property_images pi on pi.property_id = p.id
where p.listing_status = 'active'
group by
  p.id, p.title, l.name, p.property_type, p.price_pkr,
  p.area_value, p.area_unit,
  pv.seller_identity, pv.property_location, pv.photos,
  pv.ownership_evidence, pv.physical_inspection,
  pv.reviewer_display_name, pv.reviewed_at
order by l.name, p.created_at desc;

select
  count(*) as inquiry_count
from public.property_inquiries;
