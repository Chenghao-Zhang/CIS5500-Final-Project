import { useEffect, useState } from 'react';
import background from '../img/bkg.png';
import { useParams } from 'react-router-dom';
import { deepPurple } from '@mui/material/colors';
import { Container, Typography, Divider, Grid, Avatar, IconButton, Button, Rating, Card, CardContent} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { Box } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../helpers/cookie';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import UserReviews from '../components/UserReviews';
import UserAvatar from '../components/UserAvatar'
import { Link } from 'react-router-dom';

const config = require('../config.json');

const checkFollow = async (currentUserId, targetUserId) => {
  const response = await fetch(`http://${config.server_host}:${config.server_port}/follow/check?follower_id=${currentUserId}&following_id=${targetUserId}`);
  const data = await response.json();
  // console.log('checkFollow:', data);
  return data.isFollowed;
};

// TODO：解决重复打开需要全局状态管理，先不做
export default function UserProfilePage() {
  const navigate = useNavigate();
  // name must same as dynamic param
  const { user_id } = useParams();
  const [user, setUser] = useState(null);
  const [followingStatus, setFollowingStatus] = useState(false);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [userPreferenceCategoryList, setUserPreferenceCategoryList] = useState([]);
  const [influentialFriends, setInfluentialFriends] = useState([]);

  useEffect(() => {
    setFollowersOpen(false);
    setFollowingOpen(false);
  }, [user_id])

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/user/${user_id}`)
      .then(res => res.json())
      .then(resJson => setUser(resJson));

    const currentUserId = loginUser().userId;
    if (currentUserId && user_id) {
      checkFollow(currentUserId, user_id)
      .then(fs => setFollowingStatus(fs))
      .catch(error => console.error('Error checking follow status:', error));
    }
  }, [user_id, followingStatus]);

  useEffect(() => {
    // Fetch followers and following lists
    const fetchLists = async () => {
      if (user_id) {
        const followersResponse = await fetch(`http://${config.server_host}:${config.server_port}/follow/follower/${user_id}`);
        const followingResponse = await fetch(`http://${config.server_host}:${config.server_port}/follow/following/${user_id}`);
        const userPreferenceCategoryResponse = await fetch(`http://${config.server_host}:${config.server_port}/user/preference/category/${user_id}`);

        const influentialFriendsRes = await fetch(`http://${config.server_host}:${config.server_port}/influential/friends?user_id=${user_id}`)

        const followersData = await followersResponse.json();
        const followingData = await followingResponse.json();
        const userPreferenceCategoryData = await userPreferenceCategoryResponse.json();
        const influentialFriends = await influentialFriendsRes.json()

        setFollowersList(followersData);
        setFollowingList(followingData);
        setUserPreferenceCategoryList(userPreferenceCategoryData);
        setInfluentialFriends(influentialFriends)
      }
    };

    if (user) {
      console.log('fetching lists')
      fetchLists();
    }
  }, [user_id, user, followingStatus]);

  const handleFollowClick = async () => {
    if(followingStatus===true){
      fetch(`http://${config.server_host}:${config.server_port}/follow`,
        {
            method: 'DELETE',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ follower_id: loginUser().userId, following_id: user_id })
        }
      ).then(res => res.json())
      .then(resJson => {
        if(resJson.success===true){
          setFollowingStatus(false);
        }
      })
    } else {
        fetch(`http://${config.server_host}:${config.server_port}/follow`,
        {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ follower_id: loginUser().userId, following_id: user_id })
        }
      ).then(res => res.json())
      .then(resJson => {
        if(resJson.success===true){
          setFollowingStatus(true);
        }
      })
    }
  };

  const handleFollowersClick = () => {
    setFollowersOpen(true);
  };

  const handleFollowingClick = () => {
    setFollowingOpen(true);
  };

  const handleCloseFollowers = () => {
    setFollowersOpen(false);
  };

  const handleCloseFollowing = () => {
    setFollowingOpen(false);
  };

  if (user === null) {
    return (
      <Container maxWidth="lg">
        <h2>Loading User Profile...</h2>
      </Container>
    );
  }

  const CustomCategoryCardRow = ({ data, field }) => {
    if (data.length === 0 || data === null) {
      return (
        <Grid container justifyContent="center">
          <Grid item xs={12} style={{ padding: "16px" }}>
            <Card style={{ width: "100%", height: "100%" }}>
              <CardContent style={{ textAlign: "center", height: "100%", alignItems: "center" }}>
                <Typography variant="h6" textAlign={'center'}>No Results</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }

    try {
      const ret = (
        <Grid container spacing={2} justifyContent="left">
          {data.map((row, index) => (
            <Grid key={row.id} item xs={4}>
              <Card alignItems={"center"}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="h6" component="div">
                        <Link>{row.category}</Link>
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      {/* <Typography variant="body1" color="textSecondary">
                        Business ID: {row.business_id}
                      </Typography> */}
                      <Typography variant="body1" color="textSecondary">
                        <span style={{ fontWeight: 'bold' }}>Category Count: </span>
                        {row.category_count}
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        <span style={{ fontWeight: 'bold' }}>Average Rating: </span>
                        {row.average_rating}
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        <span style={{ fontWeight: 'bold' }}>Min Rating: </span>
                        {row.min_rating}
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        <span style={{ fontWeight: 'bold' }}>Max Rating: </span>
                        {row.max_rating}
                      </Typography>
                      {/* <Typography variant="body1" color="textSecondary">
                        <span style={{ fontWeight: 'bold' }}>Highest Rated Business: </span>
                        {row.highest_rated_business}
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        <span style={{ fontWeight: 'bold' }}>Lowest Rated Business: </span>
                        {row.lowest_rated_business}
                      </Typography> */}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
      return ret;
    } catch (error) {
      console.error('Error rendering CustomCategoryCardRow:', error);
      return (
        <Grid container justifyContent="center">
          <Grid item xs={12} style={{ padding: "16px" }}>
            <Card style={{ width: "100%", height: "100%" }}>
              <CardContent style={{ textAlign: "center", height: "100%", alignItems: "center" }}>
                <Typography variant="h6" textAlign={'center'}>No Results</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }
  };


  const InfluentialFriendsList = ({ data, field }) => {
    if (data.length === 0 || data === null) {
      return (
        <Grid container justifyContent="center">
          <Grid item xs={12} style={{ padding: "16px" }}>
            <Card style={{ width: "100%", height: "100%" }}>
              <CardContent style={{ textAlign: "center", height: "100%", alignItems: "center" }}>
                <Typography variant="h6" textAlign={'center'}>No Results</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }

    try {
      const ret = (
        <Grid container spacing={2} justifyContent="left">
          {data.map((row, index) => (
            <Grid key={row.id} item xs={4}>
              <Card alignItems={"center"}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="h6" component="div">
                        <Link>{row.category}</Link>
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1" color="textSecondary">
                        <span style={{ fontWeight: 'bold' }}>FriendName: </span>
                        {row.FriendName}
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        <span style={{ fontWeight: 'bold' }}>TotalReviews: </span>
                        {row.TotalReviews}
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        <span style={{ fontWeight: 'bold' }}>AvgRating: </span>
                        {row.AvgRating}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
      return ret;
    } catch (error) {
      console.error('Error rendering CustomCategoryCardRow:', error);
      return (
        <Grid container justifyContent="center">
          <Grid item xs={12} style={{ padding: "16px" }}>
            <Card style={{ width: "100%", height: "100%" }}>
              <CardContent style={{ textAlign: "center", height: "100%", alignItems: "center" }}>
                <Typography variant="h6" textAlign={'center'}>No Results</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }
  };

  return (
    <div style={{ backgroundImage: `url(${background})`, height: '100vh', backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center', overflow: 'auto' }}>
      <Container maxWidth="lg" style={{backgroundColor: 'rgba(255, 255, 255, 0.85)'}}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <h2>User Profile</h2>
          <IconButton onClick={() => navigate(-1)} aria-label="back">
            <CancelIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box mt={2} mb={2} textAlign={'center'}>
          <Grid container spacing={4} textAlign={'left'}>
            <Grid item xs={2}>
              <Avatar sx={{ bgcolor: deepPurple[500] }}>{user.name[0].toUpperCase()}</Avatar>
            </Grid>
            <Grid item xs={2}>
              <Button variant="contained" color="primary" 
              disabled={user_id === loginUser().userId}
              onClick={handleFollowClick}
              >
                  {followingStatus ? 'Unfollow' : 'Follow'}
              </Button>
            </Grid>
            {/* Followers list button */}
            <Grid item xs={2}>
              <Button variant="outlined" onClick={handleFollowersClick}>Followers</Button>
            </Grid>

            {/* Following list button */}
            <Grid item xs={2}>
              <Button variant="outlined" onClick={handleFollowingClick}>Following</Button>
            </Grid>

            <Dialog open={followersOpen} onClose={handleCloseFollowers} fullWidth maxWidth="md">
              <DialogTitle>Followers</DialogTitle>
              <DialogContent sx={{ overflowY: 'auto', height: '60vh', width: '500px' }}>
                <Box sx={{ width: '100%' }}>
                  <List>
                    {followersList.map(follower => (
                      <ListItem key={follower.user_id}>
                        <UserAvatar user={{id:follower.user_id, name:follower.name}}/>
                        <ListItemText primary={follower.name} secondary={`ID: ${follower.user_id}`} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseFollowers}>Close</Button>
              </DialogActions>
            </Dialog>

            <Dialog open={followingOpen} onClose={handleCloseFollowing} fullWidth maxWidth="md">
              <DialogTitle>Following</DialogTitle>
              <DialogContent sx={{ overflowY: 'auto', height: '60vh', width: '500px' }}>
                <Box sx={{ width: '100%' }}>
                  <List>
                    {followingList.map(following => (
                      <ListItem key={following.user_id}>
                        <UserAvatar user={{id:following.user_id, name:following.name}}/>
                        <ListItemText primary={following.name} secondary={`ID: ${following.user_id}`} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseFollowing}>Close</Button>
              </DialogActions>
            </Dialog>

            <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontSize: '1.2rem' }}>User ID: {user.userId}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontSize: '1.2rem' }}>Name: {user.name}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontSize: '1.2rem'}}>Reviews: {user.review_count}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontSize: '1.2rem'}}>Fans: {user.fans}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontSize: '1.2rem' }}>Average Stars: 
              <Rating
                name="average-stars"
                value={user.average_stars}
                precision={0.1}
                size="small"
                readOnly
              />
            </Typography>
          </Grid>
          
          {/* <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontSize: '1.2rem' }}>Preference Category: {userPreferenceCategoryList}</Typography>
          </Grid> */}

          {/* <DataGrid rows={userPreferenceCategoryList} columns={columns} pageSize={5} /> */}
          <Grid item xs={12}>
            <Typography variant="h6">Preference Category</Typography>
            <br />
            <CustomCategoryCardRow data={userPreferenceCategoryList} field="category"/>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Influential Friends</Typography>
            <br />
            <InfluentialFriendsList data={influentialFriends} field="category"/>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontSize: '1.2rem' }}>Useful Compliment: {user.compliment_useful}</Typography>
          </Grid>

          </Grid>
        </Box>
        <UserReviews userId = {user_id}/>
      </Container>
    </div>
  );
}