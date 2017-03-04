SELECT 
  event.name,
  description,
  json_build_object(
    'street_address', street_address,
    'city', city.city,
    'region', city.region,
    'country', city.country,
    'longitude', ST_X(geo::geometry), 'latitude', ST_Y(geo::geometry)
  ) AS location,
  recurring,
  recommended,
  pricing,
  price,
  facebook_id
FROM event 
JOIN event_detail AS ed ON ed.event_id = event.id
JOIN city ON city.id = ed.city_id
LEFT JOIN event_occurrence AS eo ON eo.event_id = event.id
WHERE event.id = $1 AND city.city = $2;