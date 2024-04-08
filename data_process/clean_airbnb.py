"""
CREATE TABLE airbnb (
    airbnb_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    stars Decimal(2,1), (即excel里的)
    review_count INT, (即excel里的number_of_reviews)
    bathrooms INT,
    bedrooms INT,
    beds INT,
    price DECIMAL(19,2), -- 原数据是log_price, 要转化成price
    property_type VARCHAR(100),
    description TEXT,
    FOREIGN KEY (latitude, longitude) REFERENCES locations(latitude, longitude)
);
"""

# data cleaning

# setup
import numpy as np
import pandas as pd

file_name = './Airbnb_Data.csv'

# id	log_price	property_type	room_type	amenities	accommodates	bathrooms	bed_type	cancellation_policy	cleaning_fee	city	description	first_review	host_has_profile_pic	host_identity_verified	host_response_rate	host_since	instant_bookable	last_review	latitude	longitude	name	neighbourhood	number_of_reviews	review_scores_rating	thumbnail_url	zipcode	bedrooms	beds

original_col_names = ['id', 'log_price', 'property_type', 'room_type', 'amenities', 'accommodates', 'bathrooms', 'bed_type', 'cancellation_policy', 'cleaning_fee', 'city', 'description', 'first_review', 'host_has_profile_pic', 'host_identity_verified', 'host_response_rate', 'host_since', 'instant_bookable', 'last_review', 'latitude', 'longitude', 'name', 'neighbourhood', 'number_of_reviews', 'review_scores_rating', 'thumbnail_url', 'zipcode', 'bedrooms', 'beds']

keep_cols = ['id', 'log_price', 'property_type', 'bathrooms', 'bedrooms', 'beds', 'description','latitude', 'longitude', 'name', 'number_of_reviews', 'review_scores_rating']

new_col_names = ['airbnb_id', 'price', 'property_type', 'bathrooms', 'bedrooms', 'beds', 'description', 'latitude', 'longitude', 'name', 'review_count', 'stars']

reordered_cols = ['airbnb_id', 'name', 'latitude', 'longitude', 'stars', 'price', 'property_type', 'description', 'review_count', 'bathrooms', 'bedrooms', 'beds']

# read data
dataframe = pd.read_csv(file_name, header=0, names=original_col_names, encoding='utf-8')
print(dataframe.head())

# drop columns
dataframe = dataframe.loc[:, keep_cols]

# rename columns
dataframe.columns = new_col_names

# reorder columns
dataframe = dataframe.loc[:, reordered_cols]

# convert log_price to price
dataframe['price'] = np.exp(dataframe['price'])

# convert review_scores_rating to stars
dataframe['stars'] = dataframe['stars'] / 20

# drop rows with missing values and NOT NULL requirements
dataframe = dataframe.dropna(subset=['airbnb_id', 'latitude', 'longitude'])

# set empty to NULL
dataframe = dataframe.replace('', np.nan)

# save to csv
dataframe.to_csv('./cleaned_airbnb.csv', index=False, encoding='utf-8')

