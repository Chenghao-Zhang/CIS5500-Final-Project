const express = require('express');
const session = require('express-session');
const config = require('./config');
const routes = require('./routes');
const authMiddle = require('./middle/auth');

const app = express();
app.use(function(req, res, next) {
  res.header('Content-Type', 'application/json;charset=UTF-8')
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})
// parse body params
app.use(express.json());
// session
app.use(session({
  secret: '2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    httpOnly: true, // Prevent access via JS scripts
    secure: process.env.NODE_ENV === 'production',
  },
}));

// INNDULGE
app.post('/user/register', routes.userRegister);
app.post('/user/login', routes.userLogin);
app.post('/user/logout', routes.userLogout);
app.get('/user/getUserInfo', authMiddle, routes.getUserInfo);
app.post('/follow', routes.follow);
app.delete('/follow', routes.unfollow);
app.get('/follow/check', routes.checkFollow);
app.get('/follow/following/:follower_id', routes.getFollowingList);
app.get('/follow/follower/:following_id', routes.getFollowerList);
app.get('/user/:user_id', routes.userInfo);
app.get('/user/preference/:user_id', routes.userPreference);
app.get('/user/preference/category/:user_id', routes.getUserPreferenceCategory);


app.get('/photo', routes.getPhoto);
app.get('/airbnb/property', routes.airbnbPropertyType); // added cache
app.get('/business/category', routes.businessCategory); // added cache
app.get('/search/residence', routes.searchResidence); // added cache
app.get('/residence/:id', routes.residenceInfo); // added cache
app.get('/recommend/residence', routes.recommendResidences);
app.get('/search/business', routes.searchBusiness); // added cache
app.get('/business/:id', routes.businessInfo); // added cache
app.get('/recommend/business', routes.recommendEntertainments); // added cache
// app.get('/loyal/customers', routes.getLoyalCustomers);
app.get('/influential/friends', routes.getInfluentialFriends);


app.post('/review/business/add', routes.addBusinessReview);
app.post('/review/residence/add', routes.addResidenceReview);
app.get(['/review/business/:user_id/:business_id', '/review/residence/:user_id/:airbnb_id'],routes.getReviewByUser);
app.get('/review/user/:user_id', routes.getAllReviewsByUser);
app.get(['/review/business/:entity_id', '/review/residence/:entity_id'], routes.getReviewByEntity);
app.delete(['/review/business/:review_id', '/review/residence/:review_id'],routes.getReviewByUser);
app.post('/friend/preference', routes.getUserAndTheirFriendsPreferences);
app.get('/competitive/ranking', routes.getCompetitiveRanking); // added cache
app.get('/top/rated/business/friends', routes.getTopRatedBusinessesByFriends);

// Business Analysis
app.get('/ba/business/list', authMiddle, routes.getBusinessList); // added cache
app.get('/ba/popular/category', routes.getPopularBusinessCategory); // added cache
app.get('/ba/reviews/count/:year', routes.getReviewsCountMonthlyByYear); // added cache
app.get('/ba/analysis/:ym', authMiddle, routes.getOverallAnalysisByBusiness); // added cache
app.get('/ba/loyal_customers', authMiddle, routes.getloyalCustomersByBusiness); // added cache
app.get('/ba/review_type_count', authMiddle, routes.getReviewTypeCountByBusiness); // added cache

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
