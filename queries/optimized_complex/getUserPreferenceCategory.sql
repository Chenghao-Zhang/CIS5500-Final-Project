
-- create index on review_business.stars and review_business.date
-- and also convert the originally ignored cartesian join between business and category to self join
-- and also replace the unnecessary subquery checking for review stars > 3 with direct filtering.
CREATE INDEX idx_review_stars ON review_business(stars);
CREATE INDEX idx_review_date ON review_business(date);
CREATE INDEX idx_business_take_out_parking_is_open ON business(take_out, parking, is_open);
-- DROP INDEX idx_review_stars ON review_business;
-- DROP INDEX idx_review_date ON review_business;


-- improved user_id:bYENop4BuQepBjM1-BI3fA 1993ms
SELECT
    c.category,
    COUNT(*) AS category_count,
    AVG(ui.stars) AS average_rating,
    MIN(ui.stars) AS min_rating,
    MAX(ui.stars) AS max_rating,
    -- highest rated business in each category
    (SELECT b.name FROM business b
      INNER JOIN review_business rb ON b.business_id = rb.business_id
      WHERE rb.stars = (SELECT MAX(rb2.stars)
                        FROM review_business rb2
                        WHERE rb2.business_id = b.business_id)
      AND b.business_id IN (SELECT bc.business_id FROM category bc WHERE bc.category = c.category)
      LIMIT 1) AS highest_rated_business,
    -- lowest rated business in each category
    (SELECT b.name FROM business b
      INNER JOIN review_business rb ON b.business_id = rb.business_id
      WHERE rb.stars = (SELECT MIN(rb2.stars)
                        FROM review_business rb2
                        WHERE rb2.business_id = b.business_id)
      AND b.business_id IN (SELECT bc.business_id FROM category bc WHERE bc.category = c.category)
      LIMIT 1) AS lowest_rated_business
FROM
    business b
INNER JOIN
    category c ON b.business_id = c.business_id
INNER JOIN
    (
      SELECT r.business_id, r.stars
      FROM review_business r
      WHERE r.user_id = 'bYENop4BuQepBjM1-BI3fA'
      AND r.stars >= 3
      AND r.date >= '2015-01-01'
      UNION ALL
      SELECT t.business_id, NULL AS stars
      FROM tip_business t
      WHERE t.user_id = 'bYENop4BuQepBjM1-BI3fA'
      AND t.date >= '2015-01-01'
    ) AS ui ON b.business_id = ui.business_id
WHERE
    b.is_open = 1
    AND b.take_out = 1
    AND b.parking = 1
GROUP BY
    c.category
HAVING
    COUNT(*) > 1
    AND AVG(ui.stars) IS NOT NULL
    AND AVG(ui.stars) >= 3
ORDER BY
    category_count DESC, average_rating DESC
LIMIT 5;


-- original
SELECT
    c.category,
    COUNT(*) AS category_count,
    AVG(ui.stars) AS average_rating,
    MIN(ui.stars) AS min_rating,
    MAX(ui.stars) AS max_rating,
    -- highest rated business in each category
    (SELECT b.name FROM business b
      INNER JOIN review_business rb ON b.business_id = rb.business_id
      WHERE rb.stars = (SELECT MAX(rb2.stars)
                        FROM review_business rb2
                        WHERE rb2.business_id = b.business_id)
      AND b.business_id IN (SELECT bc.business_id FROM category bc WHERE bc.category = c.category)
      LIMIT 1) AS highest_rated_business,
    -- lowest rated business in each category
    (SELECT b.name FROM business b
      INNER JOIN review_business rb ON b.business_id = rb.business_id
      WHERE rb.stars = (SELECT MIN(rb2.stars)
                        FROM review_business rb2
                        WHERE rb2.business_id = b.business_id)
      AND b.business_id IN (SELECT bc.business_id FROM category bc WHERE bc.category = c.category)
      LIMIT 1) AS lowest_rated_business
FROM
    business b
JOIN
    category c
INNER JOIN
    (
      SELECT r.business_id, r.stars
      FROM review_business r
      WHERE r.user_id = 'bYENop4BuQepBjM1-BI3fA'
      AND r.business_id IN (SELECT business_id FROM business WHERE r.stars >= 3)
      AND r.date >= '2015-01-01'
      UNION ALL
      SELECT t.business_id, NULL AS stars
      FROM tip_business t
      WHERE t.user_id = 'bYENop4BuQepBjM1-BI3fA'
      AND t.date >= '2015-01-01'
    ) AS ui ON b.business_id = ui.business_id
WHERE
    b.is_open = 1
    AND b.take_out = 1
    AND b.parking = 1
GROUP BY
    c.category
HAVING
    COUNT(*) > 1
    AND AVG(ui.stars) IS NOT NULL
    AND AVG(ui.stars) >= 3
ORDER BY
    category_count DESC, average_rating DESC
LIMIT 5;

