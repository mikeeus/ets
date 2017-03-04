 SELECT
  event.name,
  city.city,
  eo.daytime,
  lower(eo.time_range) AS date,
  place.name AS place
FROM event
JOIN event_occurrence AS eo ON eo.event_id = event.id
JOIN event_detail AS ed ON ed.event_id = event.id 
LEFT JOIN place on place.id = event.place_id
JOIN city ON city.id = ed.city_id
WHERE city.city = $1
  AND event.name ILIKE $2 
LIMIT $3;