import { useEffect, useState } from 'react';
import background from '../img/bkg.png';
import { useParams } from 'react-router-dom';
import { deepPurple } from '@mui/material/colors';
import { Container, Typography, Divider, Grid, Avatar, IconButton, Button, Rating } from '@mui/material';
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

        const followersData = await followersResponse.json();
        const followingData = await followingResponse.json();

        setFollowersList(followersData);
        setFollowingList(followingData);
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
              <Typography variant="subtitle1">User ID: {user.userId}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Name: {user.name}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Reviews: {user.review_count}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Fans: {user.fans}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Average Stars: 
              <Rating
                name="average-stars"
                value={user.average_stars}
                precision={0.1}
                size="small"
                readOnly
              />
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Useful Compliment: {user.compliment_useful}</Typography>
            </Grid>
          </Grid>
        </Box>
        <UserReviews userId = {user_id}/>
      </Container>
    </div>
  );
}