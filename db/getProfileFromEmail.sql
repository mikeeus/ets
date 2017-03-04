SELECT
  ap.id,
  ap.email,
  ap.first_name,
  ap.last_name,
  ap.display_name
FROM account_profile AS ap
WHERE ap.email = $1;