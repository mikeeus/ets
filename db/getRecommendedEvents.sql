SELECT
  eo.id,
  event.name,
  event.category,
  ei.url AS cover_image,
  place.name AS place,
  lower(eo.time_range) AS date
FROM event_occurrence AS eo
  JOIN event ON eo.event_id = event.id
  LEFT JOIN place ON event.place_id = place.id
  LEFT JOIN event_image AS ei ON event.cover_id = ei.id
WHERE event.recommended = true
GROUP BY
  eo.id,
  event.id,
  place.id,
  ei.id
LIMIT $1;