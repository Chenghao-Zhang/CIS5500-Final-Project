const mysql = require('mysql2')
const config = require('./local_config.json')
const uuid = require('uuid'); // generate uuid
const bcrypt = require('bcrypt'); // encrypt secret
const e = require('express');

const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
  authPlugins: {
    mysql_clear_password: () => () => Buffer.from(password + '\0')
  }
});
connection.connect((err) => err && console.log(err));

const salt = bcrypt.genSaltSync(10);

// User Control
const userRegister = async function(req, res) {
  const { username, password, confirmPassword } = req.body;

  try {
    connection.query('SELECT * FROM user WHERE name = ?', [username], async (err, rows) => {
      if (err) {
        console.error('Error checking existing user:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else if (rows.length > 0) {
        res.status(501).json({ error: 'Username already exists' });
      } else {
        try {
          // Generate User ID
          const userId = uuid.v4();
  
          // Hash encrypt passwords
          const hashedPassword = await bcrypt.hash(password, salt);
  
          // Insert new user record into database
          connection.query('INSERT INTO user (user_id, name, password, review_count, fans, average_stars, compliment_useful) VALUES (?, ?, ?, 0, 0, 0, 0)', 
          [userId, username, hashedPassword], (err, result) => {
            if (err) {
              console.error('Error registering user:', err);
              res.status(500).json({ error: 'Internal server error' });
            }
  
            res.status(200).json({ message: 'User registered successfully', userId: userId });
          });
        } catch (error) {
          console.error('Error registering user:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    });
  } catch (error) {
    console.error('Error checking existing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const userLogin = async function(req, res) {
  const { username, password } = req.body;

  try {
    connection.query('SELECT * FROM user WHERE name = ? LIMIT 1', [username], async (err, row) => {
      if (err) {
        console.error('Error checking existing user:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else if (row.length === 0) {
        console.error('User not found:', username);
        res.status(200).json({ message: 'User not found' });
      } else if (row.length > 0) {
        try {
          row = row[0];
          const userId = row.user_id;
          const userPwd = row.password;
          // compare passwords
          if (await bcrypt.compare(password, userPwd)) {
            console.log(row);
            res.status(200).json({ message: 'Login successful', userId: userId, username: row.name });
          } else {
            res.status(501).json({ error: 'Invalid credentials' });
          }
        } catch (error) {
          console.error('Error logining user:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    });
  } catch (error) {
    console.error('Error checking existing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const userInfo = async function(req, res) {
  const userId = req.params.user_id;
  console.log('userInfo got req:', userId);
  try {
    connection.query('SELECT * FROM user WHERE user_id = ?', [userId], async (err, row) => {
      if (err) {
        console.error('Error checking existing user:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else if (row.length === 0) {
        console.error('User not found:', userId);
        res.status(200).json({ message: 'User not found' });
      } else if (row.length > 0) {
        row = row[0];
        const userStatus = {
          userId: row.user_id,
          name: row.name,
          review_count: row.review_count,
          fans: row.fans,
          average_stars: Number(row.average_stars),
          compliment_useful: row.compliment_useful
        };
        console.log(userStatus);
        res.status(200).json(userStatus);
      }
    });
  } catch (error) {
    console.error('Error checking existing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const updateFansByUser = async function(userId) {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE user
      SET fans = (
        SELECT COUNT(DISTINCT follower_id)
        FROM follow
        WHERE following_id = '${userId}'
      )
      WHERE user_id = '${userId}';
    `;
    
    connection.query(query, (err, data) => {
      if (err) {
        console.error(err);
        reject(false);
      } else {
        resolve(true);
      }
    });
  });
};

const updateReviewsByUser = async function(userId) {
  return new Promise((async (resolve, reject) => {
    const query = `
      SELECT
        COUNT(*) AS total_reviews,
        SUM(reviews.stars) AS total_stars
      FROM (
        SELECT stars FROM review_business WHERE user_id = ?
        UNION ALL
        SELECT stars FROM review_airbnb WHERE user_id = ?
      ) AS reviews;
    `;
    const updateQ = `
        UPDATE user
        SET review_count = ?, average_stars = ?
        WHERE user_id = ?
      `;
    connection.query(query, [userId, userId], (err, data) => {
      if (err) {
        console.error(err);
        reject(false);
      } else {
        const reviewCount = data[0].total_reviews || 0;
        const totalStars = data[0].total_stars || 0;
        const averageStars = reviewCount > 0 ? totalStars / reviewCount : 0;
        connection.query(updateQ, [reviewCount, averageStars, userId], (err, data) => {
          if (err) {
            console.error(err);
            reject(false);
          } else {
            console.log('update user profile: ', [reviewCount, averageStars, userId])
            resolve(true);
          }});
      }
    });
  }));
};

// follower follow following
const follow = async function(req, res) {
  const { follower_id, following_id } = req.body;
  console.log('follow: ', req.body)
  try {
    connection.query(
      'INSERT INTO follow (follower_id, following_id, follow_date) VALUES (?, ?, CURRENT_DATE)',
      [follower_id, following_id], (err, rst) => {
        console.log(err, rst);
        if (err) {
          res.status(500).json({ error: 'An error occurred while following.' });
        } else {
          updateFansByUser(following_id);
          res.status(200).json({ msg: 'Followed successfully.', success: true});
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while following.' });
  }
}

const unfollow = async function(req, res) {
  const { follower_id, following_id } = req.body;
  console.log('unfollow: ', req.body);

  try {
    connection.query(
      'DELETE FROM follow WHERE follower_id = ? AND following_id = ?',
      [follower_id, following_id],
      (err, rst) => {
        console.log(err, rst);
        if (err) {
          res.status(500).json({ error: 'An error occurred while unfollowing.' });
        } else {
          if (rst.affectedRows > 0) {
            updateFansByUser(following_id);
            res.status(200).json({ msg: 'Unfollowed successfully.', success: true });
          } else {
            res.status(404).json({ error: 'No such follow relationship found.' });
          }
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while unfollowing.' });
  }
};

const checkFollow = async function(req, res) {
  const { follower_id, following_id } = req.query;
  console.log('checkFollow: ', req.query)
  if(follower_id==following_id){
    res.status(200).json({ isFollowed: true });
  }else{
    try {
      connection.query(
        'select * from follow where follower_id = ? and following_id = ?',
        [follower_id, following_id], async (err, row) => {
          console.log('checkFollow: ', row);
          if (err) {
            console.error('Error checking following:', err);
            res.status(500).json({ error: 'Internal server error' });
          } else if (row.length === 0) {
            res.status(200).json({ isFollowed: false });
          } else if (row.length > 0) {
            res.status(200).json({ isFollowed: true });
          }
        }
      );
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while checking following.' });
    }
  }
}

const getFriendsByUserId = async function(userId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT u1.user_id AS friend_id, u1.name AS friend_name
      FROM user u1
      INNER JOIN follow f1 ON u1.user_id = f1.following_id
      INNER JOIN follow f2 ON u1.user_id = f2.follower_id
      WHERE f1.follower_id = ? AND f2.following_id = ?;
    `;

    connection.query(query, [userId, userId], (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

// interest list
const getFollowingList  = async function(req, res) {
  const follower_id = req.params.follower_id;
  console.log('getFollowingList IN PARAM:', req.params)
  try {
    connection.query(
      'SELECT u.*, f.follow_date FROM user u INNER JOIN follow f ON u.user_id = f.following_id WHERE f.follower_id = ?',
      [follower_id], (err, rst) => {
        if(err){
          res.status(500).json({ error: 'An error occurred while fetching the following list.' });
        }else if (rst.length > 0) {
          console.log(rst);
          res.status(200).json(rst);
        } else {
          res.status(200).json([]);
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the following list.' });
  }
}

// fans list
const getFollowerList  = async function(req, res) {
  const following_id = req.params.following_id;
  console.log('getFollowerList IN PARAM:', req.params)
  try {
    connection.query(
      'SELECT u.*, f.follow_date FROM user u INNER JOIN follow f ON u.user_id = f.follower_id WHERE f.following_id = ?',
      [following_id], (err, rst) => {
        if(err){
          res.status(500).json({ error: 'An error occurred while fetching the follower list.' });
        }else if (rst.length > 0) {
          console.log(rst);
          res.status(200).json(rst);
        } else {
          res.status(200).json([]);
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the followers list.' });
  }
}

// INNDULGE
const updateBusinessPP = async function() {
  return new Promise((resolve, reject) => {
    const query = `
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
    `;
    
    connection.query(query, (err, data) => {
      if (err) {
        console.error(err);
        reject(false);
      } else {
        resolve(true);
      }
    });
  });
};

const updateResidencePP = async function() {
  return new Promise((resolve, reject) => {
    const query = `
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
    `;
    
    connection.query(query, (err, data) => {
      if (err) {
        console.error(err);
        reject(false);
      } else {
        resolve(true);
      }
    });
  });
};

const getUserPreference = async function(userId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT category, COUNT(*) AS category_count
      FROM (
        SELECT c.category
        FROM review_business r
        JOIN category c ON r.business_id = c.business_id
        WHERE r.user_id = ?
        UNION ALL
        SELECT c.category
        FROM tip_business t
        JOIN category c ON t.business_id = c.business_id
        WHERE t.user_id = ?
      ) AS category_counts
      GROUP BY category
      ORDER BY category_count DESC
      LIMIT 5;
    `;
    
    connection.query(query, [userId, userId], (err, data) => {
      if (err) {
        console.error(err);
        reject([]);
      } else {
        resolve(data.map(item => item.category));
      }
    });
  });
};

const getUserBusinessesWithCategories = async function(userId) {
  return new Promise((resolve, reject) => {
    const query = `
    SELECT b.*,l.address,l.city,l.state,GROUP_CONCAT(DISTINCT c.category SEPARATOR ', ') AS categories
    FROM review_business rb
    INNER JOIN business b ON rb.business_id = b.business_id
    JOIN locations l ON b.latitude = l.latitude AND b.longitude = l.longitude
    LEFT JOIN category c ON b.business_id = c.business_id
    WHERE rb.user_id = ?
    GROUP BY rb.business_id;
    `;

    connection.query(query, [userId], (err, data) => {
      if (err) {
        console.error(err);
        reject({});
      } else {
        const businessesWithCategories = data.map(item => ({
          ...item,
          categories: item.categories ? item.categories.split(', ') : []
        }));
        console.log(businessesWithCategories);
        resolve(businessesWithCategories);
      }
    });
  });
};

const userPreference = async function(req, res) {
  const { user_id } = req.query;
  console.log("userPreference IN PARAM: ", req.query);

  try {
    const userPreference = await getUserPreference(user_id);
    console.log(userPreference);
    res.json(userPreference);
  } catch (error) {
    console.error(error);
    res.status(500).json({});
  }
};

const getPhoto = async function(req, res) {
  const { id, entity } = req.query;
  const tdb = entity==='residence'?'photo_airbnb':'photo_business'
  const tid = entity==='residence'?'airbnb_id':'business_id'
  console.log("getPhoto IN PARAM: ", req.query)

  const query = `
    SELECT *
    FROM
        ${tdb} p
    WHERE
        p.${tid} = ${id};
  `;
  connection.query(query, (err, data) => {
  if (err || data.length === 0) {
    console.log(err);
    res.status(500).json({});
  } else {
    console.log(data);
    res.json(data);
  }
});
}

const airbnbPropertyType = async function(req, res) {
  connection.query('SELECT DISTINCT property_type FROM airbnb', (err, data) => {
  if (err || data.length === 0) {
    console.log(err);
    res.json({});
  } else {
    const propertyTypes = data.map((row) => row.property_type);
    console.log(propertyTypes);
    res.json({'propertyTypes': propertyTypes});
  }
});
}


const businessCategory = async function(req, res) {
  connection.query('SELECT DISTINCT category FROM category', (err, data) => {
  if (err || data.length === 0) {
    console.log(err);
    res.json({});
  } else {
    const categories = data.map((row) => row.category);
    console.log(categories);
    res.json({'categories': categories});
  }
});
}

// Search Residence
const searchResidence = async function(req, res) {
  const { name, min_bathrooms, max_bathrooms, min_bedrooms, max_bedrooms, min_price, max_price, property, user_id } = req.query;
  console.log("searchResidence IN PARAM: ", req.query)
  // TODO: add user info、pagesize、offset
  const query = `
  SELECT *,
  ((0.4 * stars) + (0.3 * review_count)) AS score
  FROM airbnb
  WHERE
    (name LIKE '%${name}%')
    OR (property_type LIKE '%${name}%')
    OR airbnb_id IN (
        SELECT airbnb_id
        FROM review_airbnb
        WHERE user_id = '${user_id}'
    )
    AND bedrooms >= ${min_bedrooms}
    AND bedrooms <= ${max_bedrooms}
    AND bathrooms >= ${min_bathrooms}
    AND bathrooms <= ${max_bathrooms}
    AND price BETWEEN ${min_price} AND ${max_price}
    AND property_type IN (${property.split(',').map(item => `'${item.trim()}'`)})
  ORDER BY score DESC;
  `;
  //  LIMIT pageSize OFFSET ofst;
  // (0.3 * (1 / (1 + 2 * 6371 *
  //   ASIN(SQRT(POW(SIN((radians(b.latitude) - radians(user_lat)) / 2), 2) +
  //             COS(radians(user_lat)) *
  //             COS(radians(b.latitude)) *
  //             POW(SIN((radians(b.longitude) - radians(user_lon)) / 2), 2))))))

  connection.query(query, (err, data) => {
  
  if (err || data.length === 0) {
    console.log(err);
    res.status(500).json({});
  } else {
    console.log(data);
    res.json(data);
  }
});
}

// Recommend Entertainments
const recommendEntertainments = async function(req, res) {
  // residence id
  const { id } = req.query;
  console.log("recommendEntertainments IN PARAM: ", req.query);

  const queryResidence = `
  SELECT *
  FROM airbnb
  WHERE airbnb_id = ${id}
  LIMIT 1;
  `;
  connection.query(queryResidence, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.status(500).json({});
    } else {
      const rlat = data[0].latitude;
      const rlng = data[0].longitude;
      // TODO：加入用户偏好 JOIN category c ON b.business_id = c.business_id WHERE (c.category IN userPreference)
      const query = `
      SELECT b.*, l.address, l.city, l.state,
      (0.4 * b.stars) +
      (0.3 * b.review_count) +
      (0.3 * (1 / (1 + 2 * 6371 *
                      ASIN(SQRT(POW(SIN((radians(b.latitude) - radians(${rlat})) / 2), 2) +
                                COS(radians(${rlat})) *
                                COS(radians(b.latitude)) *
                                POW(SIN((radians(b.longitude) - radians(${rlng})) / 2), 2)))))) AS score
      FROM business b
      JOIN locations l ON b.latitude = l.latitude AND b.longitude = l.longitude
      GROUP BY b.business_id, l.address, l.city, l.state
      ORDER BY score DESC;
      `;
      connection.query(query, (err, data) => {
        if (err) {
          console.log(err);
          res.status(500).json({});
        } else {
          console.log(data);
          res.json(data);
        }
      });
    }
  })
}

// Get residence details
const residenceInfo = async function(req, res) {
  const id = req.params.id;
  console.log("residenceInfo IN PARAM: ", id)

  const query = `
    SELECT
      a.airbnb_id,
      l.address,
      l.city,
      l.state,
      a.name,
      a.latitude,
      a.longitude,
      a.stars,
      a.review_count,
      a.bathrooms,
      a.bedrooms,
      a.beds,
      a.price,
      a.property_type,
      a.description
    FROM
        airbnb a
    JOIN
        locations l ON a.latitude = l.latitude AND a.longitude = l.longitude
    WHERE
        a.airbnb_id = '${id}'
    LIMIT 1;
  `;
  connection.query(query, (err, data) => {
  if (err || data.length === 0) {
    console.log(err);
    res.status(500).json({});
  } else {
    console.log(data);
    res.json(data[0]);
  }
});
}

// Search Business
const searchBusiness = async function(req, res) {
  const { name = '', category = '', user_id, only_preference} = req.query;
  console.log("searchBusiness IN PARAM: ", req.query);

  try {
    const userPreference = await getUserPreference(user_id) || [];
    console.log('userPreference', userPreference);

    // Handle category and userPreference, making sure they are both non-empty arrays
    const formattedCategories = category.trim().split(',').filter(e => e!=='').map(item => `'${item.trim()}'`);
    const formattedUserPreference = userPreference.filter(e => e!=='').map(item => `'${item.trim()}'`);

    let whereClauses = [];

    if (name !== '') {
      whereClauses.push('(b.name LIKE CONCAT(\'%\', ?, \'%\'))');
    }

    if (formattedCategories.length > 0) {
      whereClauses.push(`(c.category IN (${formattedCategories.join(',')}))`);
    }

    if (formattedUserPreference.length > 0 && JSON.parse(only_preference)) {
      whereClauses.push(`(c.category IN (${formattedUserPreference.join(',')}))`);
    }
    console.log(formattedCategories, formattedUserPreference, JSON.parse(only_preference));
    // Ensure there's at least one WHERE clause before adding 'AND'
    let conditionConnector = whereClauses.length > 1 ? ' AND ' : '';

    const query = `
      SELECT b.*,
      ((0.4 * b.stars) + (0.3 * b.review_count)) AS score
      FROM business b
      JOIN category c ON b.business_id = c.business_id
      ${whereClauses.length>0?'WHERE'+whereClauses.join(conditionConnector):''}
      GROUP BY b.business_id
      ORDER BY score DESC;
    `;

    const queryParams = [];
    if (name !== '') {
      queryParams.push(name);
    }
    queryParams.push(...formattedCategories, ...formattedUserPreference);

    console.log(query, queryParams);
    connection.query(query, queryParams, (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({});
      } else if (data.length === 0) {
        res.json([]);
      } else {
        console.log(data);
        res.json(data);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({});
  }
};

// Recommend Residences
const recommendResidences = async function(req, res) {
  // business id
  const { id } = req.query;
  console.log("recommendResidences IN PARAM: ", req.query);

  const queryBusiness = `
  SELECT *
  FROM business
  WHERE business_id = ${id}
  LIMIT 1;
  `;
  connection.query(queryBusiness, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.status(500).json({});
    } else {
      const blat = data[0].latitude;
      const blng = data[0].longitude;
      const query = `
        SELECT b.*, l.address, l.city, l.state,
        (0.4 * b.stars) +
        (0.3 * b.review_count) +
        (0.3 * (1 / (1 + 2 * 6371 *
        ASIN(SQRT(POW(SIN((radians(b.latitude) - radians(${blat})) / 2), 2) +
                  COS(radians(${blat})) *
                  COS(radians(b.latitude)) *
                  POW(SIN((radians(b.longitude) - radians(${blng})) / 2), 2)))))) AS score
        FROM airbnb b
        JOIN locations l ON b.latitude = l.latitude AND b.longitude = l.longitude
        GROUP BY b.airbnb_id, l.address, l.city, l.state
        ORDER BY score DESC;
        `;
      connection.query(query, (err, data) => {
        if (err) {
          console.log(err);
          res.status(500).json({});
        } else {
          console.log(data);
          res.json(data);
        }
      });
    }
  })
}

// Get business details
const businessInfo = async function(req, res) {
  const id = req.params.id;
  console.log("businessInfo IN PARAM: ", id);

  const query = `
    SELECT
      b.business_id,
      l.address,
      l.city,
      l.state,
      b.name,
      b.latitude,
      b.longitude,
      b.stars,
      b.review_count,
      b.is_open,
      b.take_out,
      b.parking,
      b.description,
      GROUP_CONCAT(c.category SEPARATOR ', ') as categories
    FROM
      business b
    JOIN
      locations l ON b.latitude = l.latitude AND b.longitude = l.longitude
    LEFT JOIN
      category c ON b.business_id = c.business_id
    WHERE
      b.business_id = '${id}'
    GROUP BY
      b.business_id
    LIMIT 1;
  `;

  try {
    await connection.promise().query(query).then((results) => {
      if (results.length === 0) {
        res.status(404).json({ message: "Business not found" });
      } else {
        const business = results[0][0];
        console.log("Business Details: ", business);
        res.json(business);
      }
    }).catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Internal server error occurred." });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching the business info." });
  }
};

// Review System
const addResidenceReview = async function(req, res) {
  console.log("addResidenceReview IN PARAM: ", req.body);
  try {
    const { user_id, id, stars, date, text } = req.body;
    const query = `
    INSERT INTO review_airbnb (user_id, airbnb_id, stars, date, text, useful) VALUES
    (?, ?, ?, ?, ?, ?);
    `;
    connection.query(query, [user_id, id, stars, date, text, 0],
      (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).json({});
        } else {
          console.log(data);
          updateReviewsByUser(user_id);
          updateResidencePP();
          res.json({msg: data, success: true});
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review.' });
  }
};

const addBusinessReview = async function(req, res) {
  console.log("addBusinessReview IN PARAM: ", req.body);
  try {
    const { user_id, id, stars, date, text } = req.body;
    const query = `
    INSERT INTO review_business (user_id, business_id, stars, date, text, useful) VALUES
    (?, ?, ?, ?, ?, ?);
    `;
    connection.query(query, [user_id, id, stars, date, text, 0],
      (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).json({});
        } else {
          console.log(data);
          updateReviewsByUser(user_id);
          updateBusinessPP();
          res.json({msg: data, success: true});
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review.' });
  }
};

const getReviewByUser = async function(req, res) {
  try {
    const table = req.path.includes('business') ? 'review_business' : 'review_airbnb';
    const query = `
    SELECT * FROM ${table} WHERE user_id = ? AND ${table.split('_')[1]}_id = ?
    `;
    connection.query(query, [req.params.user_id, req.params.business_id || req.params.airbnb_id], 
      (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).json({});
        } else {
          console.log(data);
          res.json(data);
        }
      }
    )} catch (error) {
      res.status(500).json({ error: 'Failed to get user review.' });
    }
}

const deleteReview = async function(req, res) {
  try {
    const table = req.path.includes('business') ? 'review_business' : 'review_airbnb';
    const query = `
    DELETE FROM ${table} WHERE review_id = ?
    `;
    connection.query(query, [req.params.review_id], 
      (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).json({});
        } else {
          console.log(data);
          res.json({msg: data, success: true});
        }
      }
    )} catch (error) {
      res.status(500).json({ error: 'Failed to get user review.' });
    }
}

const getAllReviewsByUser = async function(req, res) {
  try {
    const tables = ['review_business', 'review_airbnb'];
    let allPromises = [];

    for (const table of tables) {
      const query = `
        SELECT * FROM ${table} WHERE user_id = ? ORDER BY date DESC
      `;
      
      allPromises.push(new Promise((resolve, reject) => {
        connection.query(query, [req.params.user_id], (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      }));
    }

    const allReviews = (await Promise.all(allPromises)).flat();
    allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log('allReviews:', allReviews);
    res.json(allReviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get all user reviews.' });
  }
}

const getReviewByEntity = async function(req, res) {
  try {
    const table = req.path.includes('business') ? 'review_business' : 'review_airbnb';
    const query = `
    SELECT * FROM ${table} WHERE ${table.split('_')[1]}_id = ? ORDER BY date DESC
    `;
    connection.query(query, [req.params.entity_id], 
      (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).json({});
        } else {
          console.log(data);
          res.json(data);
        }
      }
    )} catch (error) {
      res.status(500).json({ error: 'Failed to get user review.' });
    }
}

const getUserAndTheirFriendsPreferences = async function(req, res) {
  try {
    const {user_id} = req.body;
    const friendsData = await getFriendsByUserId(user_id);
    const userPreferences = await getUserPreference(user_id);
    const friendBusinessesMap = {};

    console.log('getUserAndTheirFriendsPreferences IN PARAM:', user_id)
    console.log('getUserAndTheirFriendsPreferences friendsData:', friendsData)
    console.log('getUserAndTheirFriendsPreferences userPreferences:', userPreferences)

    for (const friend of friendsData) {
      const friendBusinesses = await getUserBusinessesWithCategories(friend.friend_id);
      friendBusinessesMap[friend.friend_id] = {
        id: friend.friend_id,
        name: friend.friend_name,
        businesses: friendBusinesses
        // .filter(business => userPreferences.includes(business.categories) || !business.categories.length),
      };
    }
    console.log('getUserBusinessesWithCategories friendBusinessesMap:', friendBusinessesMap)
    res.json({friendPreference: friendsData.map(friend => {
      const friendInfo = friendBusinessesMap[friend.friend_id];
      return {
        id: friendInfo.id,
        name: friendInfo.name,
        businesses: friendInfo.businesses,
      };
    }).filter(Boolean)})

  } catch (error) {
    console.error(error);
    res.status(500).json({});;
  }
};

// Business Analysis
const getDailyReviewsByBusiness = async function(businessId, yearMonth) {
  return new Promise((resolve, reject) => {
    const query = `
    SELECT DATE(date) as day, COUNT(*) as daily_reviews
    FROM review_business
    WHERE business_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?
    GROUP BY day
    ORDER BY day ASC
    `;

    const formattedDate = `${yearMonth}-01`;
    
    connection.query(query, [businessId, formattedDate], (err, data) => {
      if (err) {
        console.error(err);
        reject([]);
      } else {
        resolve(data);
      }
    });
  });
};

const getMonthlyAvgStarsByBusiness = async function(businessId, yearMonth) {
  return new Promise((resolve, reject) => {
    const query = `
    SELECT Round(AVG(stars), 2) as avg_stars
    FROM review_business
    WHERE business_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?
    `;

    const formattedDate = `${yearMonth}-01`;
    
    connection.query(query, [businessId, formattedDate], (err, data) => {
      if (err) {
        console.error(err);
        reject([]);
      } else {
        resolve(data);
      }
    });
  });
};

const getUserPreferenceByBusiness = async function(businessId, yearMonth) {
  return new Promise((resolve, reject) => {
    const query = `
    SELECT DISTINCT user_id
    FROM review_business
    WHERE business_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?
    `;

    const formattedDate = `${yearMonth}-01`;
    
    connection.query(query, [businessId, formattedDate], (err, data) => {
      if (err) {
        console.error(err);
        reject([]);
      } else {
        const userIds = data;
        const userPreferences = [userIds.map(userId => getUserPreference(userId))];
        console.log(userPreferences);
        const categoryCounts = {};
        userPreferences.forEach(userPreference => {
          userPreference.forEach(category => {
            if (category in categoryCounts) {
              categoryCounts[category]++;
            } else {
              categoryCounts[category] = 1;
            }
          });
        });
        console.log('categoryCounts:', categoryCounts);
        resolve(categoryCounts);
      }
    });
  });
};

const getPopularBusinessCategory = async function(req, res) {
  const query  = `
  SELECT c.category, COUNT(*) AS category_count
  FROM review_business r
  JOIN category c ON r.business_id = c.business_id
  GROUP BY c.category
  ORDER BY category_count DESC;
  `

  connection.query(query, (err, data) => {
  if (err || data.length === 0) {
    console.log(err);
    res.json({'categories': []});
  } else {
    console.log(data);
    res.json({'categories': data});
  }
});
}

const getReviewsCountMonthlyByYear = async function(req, res) {
  const query = `
  SELECT DATE_FORMAT(date, '%Y-%m') as month, COUNT(*) as total_reviews
  FROM review_business
  WHERE YEAR(date) = ?
  GROUP BY month
  ORDER BY month ASC
`;
  const year = req.params.year;

  connection.query(query, [year], (err, data) => {
  if (err || data.length === 0) {
    console.log(err);
    res.json({});
  } else {
    console.log(data);
    res.json({'reviews_count': data});
  }
});
}

const getOverallAnalysisByBusiness = async function(req, res) {
  const businessId = req.params.business;
  const yearMonth = req.params.ym;

  const dailyReviews = await getDailyReviewsByBusiness(businessId, yearMonth);
  const avgStars = await getMonthlyAvgStarsByBusiness(businessId, yearMonth);
  const userPreferences = await getUserPreferenceByBusiness(businessId, yearMonth);

  console.log(dailyReviews, avgStars, userPreferences);
  res.json({'daily_reviews': dailyReviews, 'avg_stars': avgStars, 'user_preferences': userPreferences});
}


module.exports = {
  // user control
  userRegister,
  userLogin,
  userInfo,
  follow,
  unfollow,
  checkFollow,
  getFollowingList,
  getFollowerList,
  userPreference,
  // inndulge
  getPhoto,
  airbnbPropertyType,
  businessCategory,
  searchResidence,
  residenceInfo,
  recommendEntertainments,
  searchBusiness,
  businessInfo,
  recommendResidences,
  getUserAndTheirFriendsPreferences,
  // review system
  addResidenceReview,
  addBusinessReview,
  getReviewByUser,
  deleteReview,
  getAllReviewsByUser,
  getReviewByEntity,
  // business analysis
  getPopularBusinessCategory,
  getReviewsCountMonthlyByYear,
  getOverallAnalysisByBusiness,
}
