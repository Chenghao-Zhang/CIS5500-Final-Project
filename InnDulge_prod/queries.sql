-- Query user's prefered entertainment category
SELECT category, COUNT(*) AS category_count
FROM (
    SELECT c.category
    FROM review_business r
    JOIN category c ON r.business_id = c.business_id
    WHERE r.user_id = 'user_id'
    UNION ALL
    SELECT c.category
    FROM tip_business t
    JOIN category c ON t.business_id = c.business_id
    WHERE t.user_id = 'user_id'
) AS category_counts
GROUP BY category
ORDER BY category_count DESC
LIMIT 3;

-- Find entertainment based on search content and user preferences, and sort based on comprehensive evaluations
SELECT b.*,
    (0.4 * b.stars) +
    (0.3 * b.review_count) +
    (0.3 * (1 / (1 + 2 * 6371 *
     ASIN(SQRT(POW(SIN((radians(b.latitude) - radians(user_lat)) / 2), 2) +
               COS(radians(user_lat)) *
               COS(radians(b.latitude)) *
               POW(SIN((radians(b.longitude) - radians(user_lon)) / 2), 2)))))) AS score
FROM business b
JOIN category c ON b.business_id = c.business_id
WHERE
    (b.name LIKE '%content%')
    OR (c.category LIKE '%content%')
    OR (c.category IN userPreference)
GROUP BY b.business_id
ORDER BY score DESC
LIMIT pageSize OFFSET ofst;

-- Query residence
SELECT *,
    (0.4 * stars) +
    (0.3 * review_count) +
    (0.3 * (1 / (1 + 2 * 6371 *
     ASIN(SQRT(POW(SIN((radians(b.latitude) - radians(user_lat)) / 2), 2) +
               COS(radians(user_lat)) *
               COS(radians(b.latitude)) *
               POW(SIN((radians(b.longitude) - radians(user_lon)) / 2), 2)))))) AS score
FROM airbnb
WHERE 
    (name LIKE '%content%')
    OR (property_type LIKE '%content%')
    OR airbnb_id IN (
        SELECT airbnb_id
        FROM review_airbnb
        WHERE user_id = 'currentUser'
    )
    AND bedrooms >= minBed
    AND bedrooms <= maxBed
    AND bathrooms >= minBath
    AND bathrooms <= maxBath
    AND price BETWEEN minPrice AND maxPrice
    AND property_type = 'propertyType';
ORDER BY score DESC
LIMIT pageSize OFFSET ofst;

-- Query residence around entertainment
SELECT * FROM airbnb
WHERE 2 * 6371 *
     ASIN(SQRT(POW(SIN((radians(latitude) - radians(ent_lat)) / 2), 2) +
               COS(radians(ent_lat)) *
               COS(radians(latitude)) *
               POW(SIN((radians(longitude) - radians(ent_lon)) / 2), 2))) <= distance
LIMIT 10;

-- Query entertainment around residence
SELECT * FROM business
WHERE 2 * 6371 *
     ASIN(SQRT(POW(SIN((radians(latitude) - radians(resi_lat)) / 2), 2) +
               COS(radians(resi_lat)) *
               COS(radians(latitude)) *
               POW(SIN((radians(longitude) - radians(resi_lon)) / 2), 2))) <= distance
LIMIT 10;

-- Query user's recent activities
SELECT * FROM (
    SELECT 'review' AS type, review_id AS id, user_id, business_id, stars, date, text
    FROM review_business
    WHERE user_id = 'user_id'
    UNION ALL
    SELECT 'tip' AS type, NULL AS id, user_id, business_id, NULL AS stars, date, text
    FROM tip_business
    WHERE user_id = 'user_id'
    UNION ALL
    SELECT 'review' AS type, review_id AS id, user_id, airbnb_id AS business_id, stars, date, text
    FROM review_airbnb
    WHERE user_id = 'user_id'
    UNION ALL
    SELECT 'tip' AS type, NULL AS id, user_id, airbnb_id AS business_id, NULL AS stars, date, text
    FROM tip_airbnb
    WHERE user_id = 'user_id'
) AS user_activity
ORDER BY date DESC
LIMIT 5;

-- Query the categories of businesses that users like
SELECT c.category, COUNT(*) AS category_count
FROM review_business r
JOIN category c ON r.business_id = c.business_id
GROUP BY c.category
ORDER BY category_count DESC;

-- Analysis of market trends based on number of reviews
SELECT DATE_FORMAT(date, '%Y-%m') AS month_year, COUNT(*) AS review_count
FROM review_business
GROUP BY DATE_FORMAT(date, '%Y-%m')
ORDER BY month_year ASC;

-- Update business's star and review_count
UPDATE business b
SET
    b.stars = (
        SELECT AVG(r.stars)
        FROM review_business r
        WHERE r.business_id = b.business_id
    ),
    b.review_count = (
        SELECT COUNT(*)
        FROM review_business r
        WHERE r.business_id = b.business_id
    )
WHERE b.business_id IN (
    SELECT DISTINCT business_id
    FROM review_business
);

-- Update residence's star and review_count
UPDATE airbnb a
SET
    a.stars = (
        SELECT AVG(r.stars)
        FROM review_airbnb r
        WHERE r.airbnb_id = a.airbnb_id
    ),
    a.review_count = (
        SELECT COUNT(*)
        FROM review_airbnb r
        WHERE r.airbnb_id = a.airbnb_id
    )
WHERE a.airbnb_id IN (
    SELECT DISTINCT airbnb_id
    FROM review_airbnb
);