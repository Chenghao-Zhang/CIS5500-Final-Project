-- Find entertainment based on search content and user preferences, and sort based on comprehensive evaluations
SELECT *,
    (0.4 * stars) +
    (0.3 * review_count) +
    (0.3 * 2 * 6371 *
     ASIN(SQRT(POW(SIN((radians(latitude) - radians(user_lat)) / 2), 2) +
               COS(radians(user_lat)) *
               COS(radians(latitude)) *
               POW(SIN((radians(longitude) - radians(user_lon)) / 2), 2)))) AS score
FROM business
WHERE
    (name LIKE '%content%')
    OR (category LIKE '%content%')
    OR (category IN userPreference)
ORDER BY score DESC
LIMIT pageSize OFFSET ofst;

-- Find accommodation based on search content and user preferences, and sort based on comprehensive evaluations
SELECT *,
    (0.4 * stars) +
    (0.3 * review_count) +
    (0.3 * 2 * 6371 *
     ASIN(SQRT(POW(SIN((radians(latitude) - radians(user_lat)) / 2), 2) +
               COS(radians(user_lat)) *
               COS(radians(latitude)) *
               POW(SIN((radians(longitude) - radians(user_lon)) / 2), 2)))) AS score
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
    AND property_type = 'propertyType'
ORDER BY score DESC
LIMIT pageSize OFFSET ofst;

-- Query residence around specific entertainment
SELECT * FROM airbnb
WHERE 2 * 6371 *
     ASIN(SQRT(POW(SIN((radians(latitude) - radians(ent_lat)) / 2), 2) +
               COS(radians(ent_lat)) *
               COS(radians(latitude)) *
               POW(SIN((radians(longitude) - radians(ent_lon)) / 2), 2))) <= distance
LIMIT 10;

-- Query entertainment around specific residence
SELECT * FROM business
WHERE 2 * 6371 *
     ASIN(SQRT(POW(SIN((radians(latitude) - radians(resi_lat)) / 2), 2) +
               COS(radians(resi_lat)) *
               COS(radians(latitude)) *
               POW(SIN((radians(longitude) - radians(resi_lon)) / 2), 2))) <= distance
LIMIT 10;

-- Query user's recent activities and sort them in descending order by date
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

-- This query categorizes reviews as 'Positive' or 'Negative' based on their star rating, 
-- offering a simple overview of customer sentiment towards the business.
SELECT 
    (CASE WHEN stars >= 4 THEN 'Positive' ELSE 'Negative' END) AS ReviewType,
    COUNT(*) AS Count
FROM 
    review
WHERE 
    business_id = 'specific_business_id'
GROUP BY 
    ReviewType;


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

--  rank a specific business within its various categories relative to nearby competitors, based on average star ratings
WITH SpecificBusinessDetails AS (
    SELECT latitude, longitude
    FROM business
    WHERE business_id = 'specific_business_id'
), RankedBusinesses AS (
    SELECT
        c.category,
        b.business_id,
        b.name,
        b.stars,
        RANK() OVER (PARTITION BY c.category ORDER BY b.stars DESC) AS Rank
    FROM 
        business b
    JOIN 
        category c ON b.business_id = c.business_id,
        SpecificBusinessDetails sbd
    WHERE 
        ABS(b.latitude - sbd.latitude) <= 0.1
        AND ABS(b.longitude - sbd.longitude) <= 0.1
)
SELECT 
    category,
    Rank
FROM 
    RankedBusinesses
WHERE 
    business_id = 'specific_business_id'
ORDER BY 
    category;

-- Query user's prefered entertainment category
SELECT 
    b.category, 
    COUNT(*) AS category_count,
    AVG(r.stars) AS average_rating
FROM 
    business b
INNER JOIN 
    ( -- Combine reviews and tips, focusing on high-quality reviews
      SELECT r.business_id, r.stars
      FROM review_business r
      WHERE r.user_id = 'user_id' AND r.stars >= 3
      UNION ALL
      SELECT t.business_id, NULL AS stars -- Tips don't have stars, so we use NULL
      FROM tip_business t
      WHERE t.user_id = 'user_id'
    ) AS user_interactions ON b.business_id = user_interactions.business_id
WHERE 
    b.is_open = 1 -- Only consider businesses that are currently operational
GROUP BY 
    b.category
HAVING 
    COUNT(*) > 1 AND -- Ensure the user has interacted with the category more than once
    AVG(user_interactions.stars) IS NOT NULL AND -- Exclude categories only interacted with via tips without reviews
    AVG(user_interactions.stars) >= 3 -- Focus on categories where the user's average review rating is high
ORDER BY 
    category_count DESC, average_rating DESC
LIMIT 3;

-- Identify top-rated businesses (e.g., restaurants, bars) recommended by a user's friends, 
-- ensuring these places are near the user's selected Airbnb.
SELECT
    B.name AS BusinessName,
    AVG(R.stars) AS AverageRating,
    COUNT(DISTINCT R.review_id) AS NumberOfReviews,
    B.address AS Location,
    GROUP_CONCAT(DISTINCT C.category ORDER BY C.category ASC) AS Categories
FROM
    User U
JOIN
    Befriend BF ON U.user_id = BF.user_a OR U.user_id = BF.user_b
JOIN
    Review R ON R.user_id = BF.user_b OR R.user_id = BF.user_a
JOIN
    Business B ON B.business_id = R.business_id
JOIN
    Category C ON B.business_id = C.business_id
WHERE
    U.user_id = 'specific_user_id' -- Target user
    AND EXISTS (
        SELECT 1
        FROM Airbnb A
        WHERE ABS(A.latitude - B.latitude) <= 0.01 AND ABS(A.longitude - B.longitude) <= 0.01
        AND A.airbnb_id = 'specific_airbnb_id' -- Chosen Airbnb
    )
GROUP BY
    B.business_id
HAVING
    AVG(R.stars) >= 4.0 AND COUNT(DISTINCT R.review_id) >= 5
ORDER BY
    AverageRating DESC, NumberOfReviews DESC
LIMIT 10;


-- Identify businesses highly rated by a user and at least two of their friends, suggesting popular spots for group activities.
SELECT 
    B.name AS BusinessName, 
    AVG(R.stars) AS AverageRating,
    COUNT(R.review_id) AS ReviewCount
FROM 
    Business B
JOIN 
    Review R ON B.business_id = R.business_id
WHERE 
    R.stars >= 4
GROUP BY 
    B.business_id
HAVING 
    SUM(CASE WHEN R.user_id = 'specific_user_id' THEN 1 ELSE 0 END) >= 1
    AND COUNT(DISTINCT CASE WHEN R.user_id IN (
        SELECT user_a FROM Befriend WHERE user_b = 'specific_user_id'
        UNION
        SELECT user_b FROM Befriend WHERE user_a = 'specific_user_id'
    ) THEN R.user_id ELSE NULL END) >= 2
ORDER BY 
    AverageRating DESC, ReviewCount DESC
LIMIT 10;


-- Identify customers who have left multiple positive reviews (4 stars or higher) for a specific business over time, 
-- indicating loyalty or repeated satisfaction with the business's offerings.
SELECT 
    R.user_id, 
    U.name AS UserName,
    COUNT(R.review_id) AS PositiveReviewCount,
    MIN(R.date) AS FirstPositiveReview,
    MAX(R.date) AS LatestPositiveReview
FROM 
    Review R
JOIN 
    User U ON R.user_id = U.user_id
WHERE 
    R.business_id = 'specific_business_id' AND R.stars >= 4
GROUP BY 
    R.user_id, U.name
HAVING 
    COUNT(R.review_id) > 1 AND -- More than one positive review indicates repeat satisfaction
    EXISTS ( -- Ensure there's a recent positive review within the last year
        SELECT 1 
        FROM Review R2
        WHERE R2.user_id = R.user_id 
        AND R2.business_id = R.business_id 
        AND R2.stars >= 4
        AND R2.date > CURRENT_DATE - INTERVAL '1 year'
    )
ORDER BY 
    PositiveReviewCount DESC, LatestPositiveReview DESC
LIMIT 10;