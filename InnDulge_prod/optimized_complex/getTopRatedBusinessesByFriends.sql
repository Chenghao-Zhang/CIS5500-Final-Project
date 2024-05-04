use inndulge;
-- improved
-- user_id: om5ZiponkpRqUNa3pVPiRg $ airbnb_id 344  3585ms
-- 1. change left join to inner join
-- 2. Since we join businesses with categories and their location, creating a materialized view that consolidates this information will simplify queries and speed up joins:
-- cached
CREATE TABLE cached_business_details AS
SELECT
  b.business_id,
  b.name AS BusinessName,
  GROUP_CONCAT(DISTINCT c.category ORDER BY c.category ASC) AS Categories,
  l.address AS Location,
  b.latitude,
  b.longitude
FROM
  business b
JOIN
  category c ON b.business_id = c.business_id
JOIN
  locations l ON l.longitude = b.longitude AND l.latitude = b.latitude
GROUP BY
  b.business_id;

SELECT
  bd.BusinessName,
  AVG(rb.stars) AS AverageRating,
  COUNT(DISTINCT rb.review_id) AS NumberOfReviews,
  bd.Location,
  bd.Categories
FROM
  user u
JOIN
  follow f ON u.user_id = f.follower_id
JOIN
  review_business rb ON rb.user_id = f.following_id
JOIN
  cached_business_details bd ON bd.business_id = rb.business_id
WHERE
  u.user_id = 'om5ZiponkpRqUNa3pVPiRg' -- Target user
  AND EXISTS (
      SELECT 1
      FROM airbnb a
      WHERE ABS(a.latitude - bd.latitude) <= 2 AND ABS(a.longitude - bd.longitude) <= 2
      AND a.airbnb_id = 344 -- Chosen Airbnb
  )
GROUP BY
  bd.business_id
HAVING
  AVG(rb.stars) >= 4.0 AND COUNT(DISTINCT rb.review_id) >= 5
ORDER BY
  AverageRating DESC, NumberOfReviews DESC
LIMIT 10;



-- original

SELECT
      b.name AS BusinessName,
      AVG(rb.stars) AS AverageRating,
      COUNT(DISTINCT rb.review_id) AS NumberOfReviews,
      l.address AS Location,
      GROUP_CONCAT(DISTINCT c.category ORDER BY c.category ASC) AS Categories
FROM
  user u
LEFT JOIN
  follow f ON u.user_id = f.follower_id
LEFT JOIN
  review_business rb ON rb.user_id = f.following_id
LEFT JOIN
  business b ON b.business_id = rb.business_id
LEFT JOIN
  category c ON b.business_id = c.business_id
LEFT JOIN
  locations l ON l.longitude = b.longitude AND l.latitude = b.latitude
WHERE
  u.user_id = 'om5ZiponkpRqUNa3pVPiRg' -- Target user
  AND EXISTS (
      SELECT 1
      FROM airbnb a
      WHERE ABS(a.latitude - b.latitude) <= 2 AND ABS(a.longitude - b.longitude) <= 2
      AND a.airbnb_id = 344 -- Chosen Airbnb
  )
GROUP BY
  b.business_id
HAVING
  AVG(rb.stars) >= 4.0 AND COUNT(DISTINCT rb.review_id) >= 5
ORDER BY
  AverageRating DESC, NumberOfReviews DESC
LIMIT 10;




SELECT
      b.name AS BusinessName,
      AVG(rb.stars) AS AverageRating,
      COUNT(DISTINCT rb.review_id) AS NumberOfReviews,
      l.address AS Location,
      GROUP_CONCAT(DISTINCT c.category ORDER BY c.category ASC) AS Categories
FROM
  user u
JOIN
  follow f ON u.user_id = f.follower_id
JOIN
  review_business rb ON rb.user_id = f.following_id
JOIN
  business b ON b.business_id = rb.business_id
JOIN
  category c ON b.business_id = c.business_id
JOIN
  locations l ON l.longitude = b.longitude AND l.latitude = b.latitude
WHERE
  u.user_id = 'om5ZiponkpRqUNa3pVPiRg' -- Target user
  AND EXISTS (
      SELECT 1
      FROM airbnb a
      WHERE ABS(a.latitude - b.latitude) <= 2 AND ABS(a.longitude - b.longitude) <= 2
      AND a.airbnb_id = 344 -- Chosen Airbnb
  )
GROUP BY
  b.business_id
HAVING
  AVG(rb.stars) >= 4.0 AND COUNT(DISTINCT rb.review_id) >= 5
ORDER BY
  AverageRating DESC, NumberOfReviews DESC
LIMIT 10;