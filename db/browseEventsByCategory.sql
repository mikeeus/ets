SELECT
  event.name,
  eo.time_range,  
  json_build_object(
    'street_address', street_address,
    'city', city.city,
    'region', city.region,
    'country', city.country,
    'longitude', ST_X(geo::geometry), 'latitude', ST_Y(geo::geometry)
  ) AS location,
  array_agg(theme.name) AS themes,
  ei.image_url AS cover_image,
  -- array_agg(json_build_object(
  --   'url', ei.image_url, 
  --   'type', ei.type
  -- )) AS images,
  url AS facebook_link
FROM event_occurrence AS eo
  JOIN event ON eo.event_id = event.id
  JOIN event_detail AS ed ON ed.event_id = event.id 
  JOIN city ON city.id = ed.city_id
  LEFT JOIN event_theme AS et ON et.event_id = event.id 
  LEFT JOIN theme ON theme.id = et.theme_id
  LEFT JOIN facebook_event AS fe ON fe.event_id = event.id
  LEFT JOIN event_image AS ei ON event.cover_image_id = ei.id AND ei.type = 'cover'
WHERE event.category IS NULL
  AND upper(eo.time_range) > $1
GROUP BY
  event.id,
  ed.event_id,
  city.id,
  fe.url,
  eo.time_range,
  ei.id
ORDER BY 
  eo.time_range asc
LIMIT 10;