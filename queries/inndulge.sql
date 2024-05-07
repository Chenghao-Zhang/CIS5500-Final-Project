CREATE TABLE locations (
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    PRIMARY KEY (latitude, longitude)
);
CREATE TABLE business (
    business_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    stars Decimal(2,1),
    review_count INT,
    is_open TINYINT(1) CHECK (is_open IN (0, 1)),
    take_out TINYINT(1) CHECK (take_out IN (0, 1)),
    parking TINYINT(1) CHECK (parking IN (0, 1)),
    description TEXT,
    FOREIGN KEY (latitude, longitude) REFERENCES locations(latitude, longitude)
);
CREATE TABLE category (
    business_id INT NOT NULL,
    category VARCHAR(255) NOT NULL,
    PRIMARY KEY (business_id, category),
    FOREIGN KEY (business_id) REFERENCES business(business_id)
);
CREATE TABLE airbnb (
    airbnb_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    stars Decimal(2,1),
    review_count INT,
    bathrooms INT,
    bedrooms INT,
    beds INT,
    price DECIMAL(19,2),
    property_type VARCHAR(100),
    description TEXT,
    FOREIGN KEY (latitude, longitude) REFERENCES locations(latitude, longitude)
);
CREATE TABLE photo_business (
    photo_id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    label VARCHAR(255),
    FOREIGN KEY (business_id) REFERENCES business(business_id)
);
CREATE TABLE photo_airbnb (
    photo_id INT AUTO_INCREMENT PRIMARY KEY,
    airbnb_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    label VARCHAR(255),
    FOREIGN KEY (airbnb_id) REFERENCES airbnb(airbnb_id)
);
CREATE TABLE user (
    user_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    review_count INT,
    fans INT,
    average_stars DECIMAL(2,1),
    compliment_useful INT
);
CREATE TABLE befriend (
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
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    business_id INT NOT NULL,
    stars DECIMAL(2,1),
    date DATE,
    text TEXT,
    useful INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (business_id) REFERENCES business(business_id)
);
CREATE TABLE review_airbnb (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    airbnb_id INT(255) NOT NULL,
    stars DECIMAL(2,1),
    date DATE,
    text TEXT,
    useful INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (airbnb_id) REFERENCES airbnb(airbnb_id)
);
CREATE TABLE tip_business (
    user_id VARCHAR(255) NOT NULL,
    business_id INT NOT NULL,
    date DATE NOT NULL,
    text TEXT,
    useful INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (business_id) REFERENCES business(business_id),
    PRIMARY KEY (user_id, business_id, date)
);
CREATE TABLE tip_airbnb (
    user_id VARCHAR(255) NOT NULL,
    airbnb_id INT NOT NULL,
    date DATE NOT NULL,
    text TEXT,
    useful INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (airbnb_id) REFERENCES airbnb(airbnb_id),
    PRIMARY KEY (user_id, airbnb_id, date)
);

-- insert into locations
INSERT INTO locations (latitude, longitude, address, city, state) VALUES 
(37.7749, -122.4194, '1 Market St, San Francisco', 'San Francisco', 'CA'),
(40.7128, -74.0060, '1 Times Square, New York', 'New York', 'NY'),
(34.0522, -118.2437, '1111 S Figueroa St, Los Angeles', 'Los Angeles', 'CA'),
(35.0522, -117.2437, '123', 'Los Angeles', 'CA'),
(36.0522, -116.2437, '451 S Figueroa St, Los Angeles', 'Los Angeles', 'CA');

-- insert into business
INSERT INTO business (name, latitude, longitude, stars, review_count, is_open, take_out, parking, description) VALUES
('Sample Business SF', 37.7749, -122.4194, 4.5, 120, 1, 1, 0, 'A great place in San Francisco.'),
('Sample Business NY', 40.7128, -74.0060, 4.2, 85, 1, 0, 1, 'An amazing spot in New York.'),
('Sample Business S123', 35.0522, -117.2437, 4.5, 120, 1, 1, 0, 'A great place in San Francisco.'),
('Sample Business 456', 36.0522, -116.2437, 4.2, 85, 1, 0, 1, 'An amazing spot in New York.');

-- insert into category
INSERT INTO category (business_id, category) VALUES
(1, 'Restaurant'), (1, 'Coffee Shop'), (2, 'Bar'), (2, 'Nightclub'), (3, 'Bar'), (4, 'Nightclub');

-- insert into airbnb
INSERT INTO airbnb (name, latitude, longitude, stars, review_count, bathrooms, bedrooms, beds, price, property_type, description) VALUES
('Luxury Apartment SF', 37.7749, -122.4194, 4.8, 50, 2, 3, 4, 300.00, 'Apartment', 'A luxury apartment in the heart of San Francisco.'),
('Charming Studio NY', 40.7128, -74.0060, 4.6, 35, 1, 1, 2, 250.00, 'Studio', 'A charming studio in downtown New York.');

-- insert into photo_business
INSERT INTO photo_business (business_id, file_path, caption, label) VALUES
(1, '/images/business/sample-business-sf.jpg', 'Sample Business SF Exterior', 'exterior'),
(1, '/images/business/sample-business-sf-interior.jpg', 'Sample Business SF Interior', 'interior'),
(2, '/images/business/sample-business-ny.jpg', 'Sample Business NY Exterior', 'exterior');

-- insert into photo_airbnb
INSERT INTO photo_airbnb (airbnb_id, file_path, caption, label) VALUES
(1, '/images/airbnb/luxury-apartment-sf.jpg', 'Luxury Apartment SF Living Room', 'living-room'),
(1, '/images/airbnb/luxury-apartment-sf-bedroom.jpg', 'Luxury Apartment SF Bedroom', 'bedroom'),
(2, '/images/airbnb/charming-studio-ny.jpg', 'Charming Studio NY Overview', 'overview');

-- insert into user
INSERT INTO user (user_id, name, password, review_count, fans, average_stars, compliment_useful) VALUES
('user1', 'Alice', '$2b$10$Qm75/jU9Ap9cWO3Tf1aUIeounuwdtrA3TUvvLmJobofjiKBTj5JRe', 25, 100, 4.7, 150), /* password 123456*/
('user2', 'Bob', '$2b$10$Qm75/jU9Ap9cWO3Tf1aUIeounuwdtrA3TUvvLmJobofjiKBTj5JRe', 12, 50, 4.5, 75);

-- insert into befriend
INSERT INTO befriend (user_a, user_b) VALUES
('user1', 'user2');

-- insert into follow
INSERT INTO follow (follower_id, following_id, follow_date) VALUES
('user1', 'user2', CURDATE());

-- insert into review_business
INSERT INTO review_business (user_id, business_id, stars, date, text, useful) VALUES
('user1', 1, 5.0, CURDATE(), 'Great experience!', 10),
('user2', 2, 4.5, CURDATE(), 'Nice atmosphere!', 5);

-- insert into review_airbnb
INSERT INTO review_airbnb (user_id, airbnb_id, stars, date, text, useful) VALUES
('user1', 1, 4.8, CURDATE(), 'Beautiful apartment!', 15),
('user2', 2, 4.6, CURDATE(), 'Convenient location!', 8);

-- insert into tip_business
INSERT INTO tip_business (user_id, business_id, date, text, useful) VALUES
('user1', 1, CURDATE(), 'Try their signature dish!', 20),
('user2', 1, CURDATE(), 'Best coffee in town!', 10);

-- insert into tip_airbnb
INSERT INTO tip_airbnb (user_id, airbnb_id, date, text, useful) VALUES
('user1', 1, CURDATE(), 'Check out the rooftop view!', 15),
('user2', 2, CURDATE(), 'Close to public transport!', 7);