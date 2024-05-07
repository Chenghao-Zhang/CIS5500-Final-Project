use inndulge;

SELECT business_id, count(*)
FROM review_business
GROUP BY business_id
ORDER BY count(*) DESC;

-- business_id = 112511
-- optimization: we remove the unnecessary GROUP BY operation in the EXISTS operation to improve the efficiency of existential check, and replace the left join between review_business and user with inner join to reduce the number of joined tuples. We also create an index on review_business.stars and date to accelerate the filter condition in the WHERE clause, and also replace the unnecessary subquery checking for review stars > 4 with direct filtering.
-- 1. join 2. remove group by 3. index 4. remove subquery
-- 4. Create a materialized view that pre-computes the aggregation of reviews by user for a specific business, and only includes reviews that meet the criteria of having 4 or more stars and are after a certain date. This reduces the need to repeatedly filter and compute these aggregations.
-- Modify the original query to use this materialized view. This step avoids recalculating the aggregations and applying filters repeatedly.
-- improved 2139ms

CREATE INDEX idx_review_stars ON review_business(stars);
CREATE INDEX idx_review_date ON review_business(date);

DROP TABLE cached_user_reviews;

CREATE TABLE cached_user_reviews
(
    user_id VARCHAR(255),
    business_id INT,
    AverageStars FLOAT,
    positiveReviewCount INT,
    firstPositiveReview VARCHAR(7),
    latestPositiveReview VARCHAR(7),
    PRIMARY KEY (user_id, business_id)
);

INSERT INTO cached_user_reviews
SELECT
    R.user_id,
    R.business_id,
    AVG(R.stars) AS AverageStars,
    COUNT(R.review_id) AS positiveReviewCount,
    MIN(DATE_FORMAT(R.date, '%Y-%m')) AS firstPositiveReview,
    MAX(DATE_FORMAT(R.date, '%Y-%m')) AS latestPositiveReview
FROM
    review_business R
WHERE
    R.stars >= 4 AND R.date > '2015-01-01'
GROUP BY
    R.user_id, R.business_id;

SELECT
    c.business_id AS id,
    c.user_id,
    U.name AS userName,
    c.AverageStars,
    c.positiveReviewCount,
    c.firstPositiveReview,
    c.latestPositiveReview
FROM
    cached_user_reviews c
JOIN
    user U ON c.user_id = U.user_id
WHERE
    c.business_id = 112511 AND
    c.positiveReviewCount > 1
ORDER BY
    c.positiveReviewCount DESC, c.latestPositiveReview DESC
LIMIT 10;


-- original 26445ms



# SELECT
#     R.business_id AS id,
#     R.user_id,
#     U.name AS userName,
#     AVG(R.stars) AS AverageStars,
#     COUNT(R.review_id) AS positiveReviewCount,
#     DATE_FORMAT(MIN(R.date), '%Y-%m') AS firstPositiveReview,
#     DATE_FORMAT(MAX(R.date), '%Y-%m') AS latestPositiveReview
# FROM
#     review_business R
# LEFT JOIN
#     user U ON R.user_id = U.user_id
# WHERE
#     R.business_id = 112511 AND r.business_id IN (SELECT business_id FROM business WHERE r.stars >= 4)
# GROUP BY
#     R.user_id, U.name
# HAVING
#     COUNT(R.review_id) > 1 AND
#     EXISTS (
#         SELECT 1
#         FROM review_business R2
#         WHERE R2.user_id = R.user_id
#         AND R2.business_id = R.business_id
#         AND R2.stars >= 4
#         AND R2.date > '2015-01-01'
#         GROUP BY r2.user_id
#     )
# ORDER BY
#     positiveReviewCount DESC, latestPositiveReview DESC
# LIMIT 10;
#
