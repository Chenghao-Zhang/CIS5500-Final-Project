
-- searchResidence
SELECT *, l.address, l.city, l.state, l.latitude, l.longitude
  ((1 * stars) + (0.01 * review_count)) AS score
FROM airbnb
JOIN locations l ON airbnb.latitude = l.latitude AND airbnb.longitude = l.longitude
WHERE
  (name LIKE '%${name}%'
  OR property_type LIKE '%${name}%'
  OR airbnb_id IN (
      SELECT airbnb_id
      FROM review_airbnb
      WHERE user_id = '${user_id}'
  ))
  AND bedrooms >= ${min_bedrooms}
  AND bedrooms <= ${max_bedrooms}
  AND bathrooms >= ${min_bathrooms}
  AND bathrooms <= ${max_bathrooms}
  AND price BETWEEN ${min_price} AND ${max_price}
  AND property_type IN (${property_types})
  AND l.city = '${city}'
ORDER BY score DESC;

-- searchBusiness
SELECT b.*, l.address, l.city, l.state, l.latitude, l.longitude,
((0.4 * b.stars) + (0.3 * b.review_count)) AS score
FROM business b
JOIN locations l ON b.latitude = l.latitude AND b.longitude = l.longitude
JOIN category c ON b.business_id = c.business_id
${whereClauses.length>0?'WHERE'+whereClauses.join(conditionConnector):''} -- add city for user input
GROUP BY b.business_id
ORDER BY score DESC;

-- query residence around a particular business 用在searchbusiness的小窗口里
SELECT a.*, l.address, l.city, l.state, l.latitude, l.longitude,
    (6371 * acos(
        cos(radians(${lat})) * cos(radians(l.latitude)) *
        cos(radians(l.longitude) - radians(${lon})) +
        sin(radians(${lat})) * sin(radians(l.latitude))
    )) AS distance_km
FROM airbnb a
JOIN locations l ON a.latitude = l.latitude AND a.longitude = l.longitude
WHERE
    (6371 * acos(
        cos(radians(${lat})) * cos(radians(l.latitude)) *
        cos(radians(l.longitude) - radians(${lon})) +
        sin(radians(${lat})) * sin(radians(l.latitude))
    )) <= 10 -- Setting the distance limit to 10 kilometers, pick a suitable one
ORDER BY distance_km ASC;

-- query business around a particular residence 就是 routes里的getTopRatedBusinessesByFriends
-- 用在searchResidence的小窗口里