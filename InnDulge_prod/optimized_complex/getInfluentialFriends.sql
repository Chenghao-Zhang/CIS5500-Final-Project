use inndulge;

SELECT COUNT(DISTINCT following_id)
FROM follow
WHERE follower_id = '_5BQBgO2w0AtMJv9nEl1jA'

SELECT follower_id, COUNT(*)
FROM follow
GROUP BY follower_id
ORDER BY COUNT(*) DESC;

CREATE TABLE follow_copy AS
SELECT *
FROM follow;


-- change LEFT JOIN to INNER JOIN to reduce the number of tuples to be joined and improve the efficiency of join,
-- also push upwards the selection filter on follows table into the join operation, which can highly reduce the amount of tuples in the join operation in advance to prevent redundancy.
-- also create index on review_business.stars to accelerate filtering by using index range scan

-- Oi1qbcz2m2SnwUeztGYcnQ 2378ms
CREATE INDEX idx_review_stars ON review_business(stars);

WITH FriendReviews AS (
      SELECT
          bf.friend_id,
          COUNT(r.review_id) AS TotalReviews,
          AVG(r.stars) AS AverageRating,
          MIN(r.stars) AS MinRating  -- Universal check: Ensure all reviews are above a certain quality
      FROM (SELECT following_id AS friend_id FROM follow WHERE follower_id = 'Oi1qbcz2m2SnwUeztGYcnQ') bf
      JOIN review_business r ON bf.friend_id = r.user_id
      JOIN review_business myr ON r.business_id = myr.business_id AND myr.user_id = 'Oi1qbcz2m2SnwUeztGYcnQ'
      GROUP BY bf.friend_id
      HAVING COUNT(r.review_id) > 1 AND MIN(r.stars) >= 3 -- Ensuring all reviews are at least 4 stars
)
SELECT
  u.name AS FriendName,
  fr.TotalReviews,
  ROUND(fr.AverageRating, 2) AS AvgRating
FROM
  FriendReviews fr
JOIN
  user u ON fr.friend_id = u.user_id
WHERE
  EXISTS (  -- Existential check: Ensure there is at least one business both have highly rated
      SELECT 1
      FROM review_business rb
      JOIN review_business ur ON rb.business_id = ur.business_id
      WHERE rb.user_id = fr.friend_id AND ur.user_id = 'Oi1qbcz2m2SnwUeztGYcnQ'
      AND rb.stars >= 3 AND ur.stars >= 3
  )
ORDER BY
  fr.TotalReviews DESC, fr.AverageRating DESC
LIMIT 10;

-- original
WITH FriendReviews AS (
      SELECT
          bf.friend_id,
          COUNT(r.review_id) AS TotalReviews,
          AVG(r.stars) AS AverageRating,
          MIN(r.stars) AS MinRating  -- Universal check: Ensure all reviews are above a certain quality
      FROM (SELECT following_id AS friend_id FROM follow) bf
      LEFT JOIN review_business r ON bf.friend_id = r.user_id
      LEFT JOIN review_business myr ON r.business_id = myr.business_id AND myr.user_id = 'Oi1qbcz2m2SnwUeztGYcnQ'
      WHERE bf.friend_id = 'Oi1qbcz2m2SnwUeztGYcnQ'
      GROUP BY bf.friend_id
      HAVING COUNT(r.review_id) > 1 AND MIN(r.stars) >= 3 -- Ensuring all reviews are at least 4 stars
)
SELECT
  u.name AS FriendName,
  fr.TotalReviews,
  ROUND(fr.AverageRating, 2) AS AvgRating
FROM
  FriendReviews fr
JOIN
  user u ON fr.friend_id = u.user_id
WHERE
  EXISTS (  -- Existential check: Ensure there is at least one business both have highly rated
      SELECT 1
      FROM review_business rb
      JOIN review_business ur ON rb.business_id = ur.business_id
      WHERE rb.user_id = fr.friend_id AND ur.user_id = 'Oi1qbcz2m2SnwUeztGYcnQ'
      AND rb.stars >= 3 AND ur.stars >= 3
  )
ORDER BY
  fr.TotalReviews DESC, fr.AverageRating DESC
LIMIT 10;

