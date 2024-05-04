-- Efficiency in Joins: By moving the logic to identify shared reviewers directly into the JOIN condition, the query potentially reduces the amount of data that needs to be joined and processed in the outer query.

-- improved
With Ranking AS (
SELECT
    b.business_id,
    c.category AS Category,
    b.name AS BusinessName,
    AVG(r.stars) AS AverageRating,
    COUNT(r.review_id) AS ReviewCount,
    DENSE_RANK() OVER (PARTITION BY c.category ORDER BY AVG(r.stars) DESC, COUNT(r.review_id) DESC) AS Ranks
FROM
    business b
JOIN
    review_business r ON b.business_id = r.business_id
JOIN
    category c ON b.business_id = c.business_id
INNER JOIN
    (
        SELECT DISTINCT
            r.business_id
        FROM
            review_business r
        INNER JOIN
            review_business r2 ON r2.business_id = 7 AND r2.user_id = r.user_id
        GROUP BY
            r.business_id
        HAVING
            COUNT(DISTINCT r.user_id) >= 3
    ) AS SharedReviewers ON b.business_id = SharedReviewers.business_id
WHERE
    EXISTS (
        SELECT 1
        FROM review_business r2
        WHERE r2.business_id = b.business_id AND r2.user_id IN (
            SELECT user_id
            FROM review_business
            WHERE business_id = 7
        )
    )
GROUP BY
    c.category, b.business_id, b.name
ORDER BY
    c.category)
SELECT r.BusinessName, r.Category, r.Ranks
FROM Ranking r
WHERE business_id = 7
ORDER BY r.Ranks ASC;


-- original
WITH Ranking AS (
    SELECT
        b.business_id,
        c.category AS Category,
        b.name AS BusinessName,
        AVG(r.stars) AS AverageRating,
        COUNT(r.review_id) AS ReviewCount,
        DENSE_RANK() OVER (PARTITION BY c.category ORDER BY AVG(r.stars) DESC, COUNT(r.review_id) DESC) AS Ranks
    FROM
        business b
    JOIN
        review_business r ON b.business_id = r.business_id
    JOIN
        category c ON b.business_id = c.business_id
    WHERE
        b.business_id IN (
            -- Select businesses that share at least three reviewers with business_id = 7
            SELECT r1.business_id
            FROM review_business r1
            WHERE EXISTS (
                SELECT 1
                FROM review_business r2
                WHERE r2.business_id = 7 AND r2.user_id = r1.user_id
            )
            GROUP BY r1.business_id
            HAVING COUNT(DISTINCT r1.user_id) >= 3
        )
    GROUP BY
        c.category, b.business_id, b.name
)
-- Select entries from the CTE where the business_id is 7
SELECT r.BusinessName, r.Category, r.Ranks
FROM Ranking r
WHERE r.business_id = 7
ORDER BY r.Ranks ASC;
