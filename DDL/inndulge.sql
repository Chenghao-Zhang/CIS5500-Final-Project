CREATE TABLE locations (
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    PRIMARY KEY (latitude, longitude)
);
CREATE TABLE business (
    business_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    stars Decimal(2,1),
    review_count INT,
    is_open TINYINT(1) CHECK (is_open IN (0, 1)), -- true就为1，否则0 以下都是
    take_out TINYINT(1) CHECK (take_out IN (0, 1)),
    parking TINYINT(1) CHECK (parking IN (0, 1)), -- business parking内五项有一项为true就为1
    description TEXT,
    FOREIGN KEY (latitude, longitude) REFERENCES locations(latitude, longitude)
);
CREATE TABLE category (
    business_id VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    PRIMARY KEY (business_id, category),
    FOREIGN KEY (business_id) REFERENCES business(business_id)
);
CREATE TABLE airbnb (
    airbnb_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    stars Decimal(2,1),
    review_count INT,
    bathrooms INT,
    bedrooms INT,
    beds INT,
    price DECIMAL(19,2), -- 原数据是log_price, 要转化成price
    property_type VARCHAR(100),
    description TEXT,
    FOREIGN KEY (latitude, longitude) REFERENCES locations(latitude, longitude)
);
CREATE TABLE photo_business (
    photo_id VARCHAR(255) PRIMARY KEY,
    business_id VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    label VARCHAR(255),
    FOREIGN KEY (business_id) REFERENCES business(business_id)
);
CREATE TABLE photo_airbnb (
    photo_id VARCHAR(255) PRIMARY KEY,
    airbnb_id VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    label VARCHAR(255),
    FOREIGN KEY (airbnb_id) REFERENCES airbnb(airbnb_id)
);
CREATE TABLE user (
    user_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    review_count INT,
    fans INT,
    average_stars DECIMAL(2,1),
    compliment_useful INT
);
CREATE TABLE befriend ( --注意不要有重复的；比如user_a = Mike; user_b = Jack 和user_b = Jack; user_a = Mike是一样的
    user_a VARCHAR(255) NOT NULL,
    user_b VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_a) REFERENCES user(user_id),
    FOREIGN KEY (user_b) REFERENCES user(user_id),
    PRIMARY KEY (user_a, user_b)
);
CREATE TABLE follow (
    follower_id VARCHAR(255) NOT NULL,
    following_id VARCHAR(255) NOT NULL,
    follow_date DATE,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES user(user_id),
    FOREIGN KEY (following_id) REFERENCES user(user_id)
);
CREATE TABLE review_business (
    review_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    business_id VARCHAR(255) NOT NULL,
    stars DECIMAL(2,1),
    date DATE,
    text TEXT,
    useful INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (business_id) REFERENCES business(business_id)
);
CREATE TABLE review_airbnb (
    review_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    airbnb_id VARCHAR(255) NOT NULL,
    stars DECIMAL(2,1),
    date DATE,
    text TEXT,
    useful INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (airbnb_id) REFERENCES airbnb(airbnb_id)
);
CREATE TABLE tip_business (
    user_id VARCHAR(255) NOT NULL,
    business_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    text TEXT,
    useful INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (business_id) REFERENCES business(business_id),
    PRIMARY KEY (user_id, business_id, date)
);
CREATE TABLE tip_airbnb (
    user_id VARCHAR(255) NOT NULL,
    airbnb_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    text TEXT,
    useful INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (airbnb_id) REFERENCES airbnb(airbnb_id),
    PRIMARY KEY (user_id, airbnb_id, date)
);