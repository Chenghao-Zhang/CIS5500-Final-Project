import React, { useState, useEffect } from 'react';
import background from '../img/bkg.png';
import { Container, Grid, Typography, Button, Card, CardContent, Rating } from '@mui/material';
import { loginUser } from '../helpers/cookie';
import { apiCall } from '../helpers/apicall';
import UserAvatar from '../components/UserAvatar'

export default function FriendList() {
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [friendsData, setFriendsData] = useState([]);

  useEffect(() => {
    const fetchFriendsPreferences = async () => {
      try {
        const response =  await apiCall('POST', 'friend/preference', { user_id: loginUser().userId });
        console.log(response);
        setFriendsData(response.friendPreference);
      } catch (error) {
        console.error('Error fetching friends preferences:', error);
      }
    };

    fetchFriendsPreferences();
  }, []);

  const handleFriendClick = (friendId) => {
    setSelectedFriendId(friendId);
  };

  const renderFriendItem = (friend) => (
    <Button
      key={friend.id}
      onClick={() => handleFriendClick(friend.id)}
      sx={{
        mb:1,
        textAlign: 'right',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        textDecoration: 'none',
        '&:hover': { textDecoration: 'none' },
      }}
    >
      <UserAvatar user={{id:friend.id, name:friend.name}}/>
      <Typography variant="body1">{friend.name}</Typography>
    </Button>
  );

  const renderBusinesses = (friendId) => {
    const selectedFriend = friendsData.find(friend => friend.id === friendId);
    if (!selectedFriend||selectedFriend.businesses.length === 0) return (
        <Card sx={{ marginBottom: 2 }}>
        <CardContent>
        <h4>There seems to be no information...</h4>
        </CardContent>
        </Card>
    );

    return (
        <Grid container spacing={2}>
        {selectedFriend.businesses.map((business, index) => (
            <Grid item xs={12} key={index}>
            <Card sx={{ marginBottom: 2 }}>
                <CardContent>
                <Typography variant="h6">{business.name}</Typography>
                <Typography variant="body2">
                    Address: {business.address}, {business.city}, {business.state}
                </Typography>
                <Typography variant="body2">
                    Stars:
                    <Rating
                    name={`rating-${index}`}
                    value={Number(business.stars)}
                    precision={0.1}
                    size="small"
                    readOnly
                    />
                    <span>({business.review_count} reviews)</span>
                </Typography>
                </CardContent>
            </Card>
            </Grid>
        ))}
        </Grid>
    );
  };

  return (
    <div style={{ backgroundImage: `url(${background})`, height: '100vh', backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center', overflow: 'auto' }}>
      <Container maxWidth="lg" sx={{ mt:3 }} style={{backgroundColor: 'rgba(255, 255, 255, 0.85)', overflow: 'auto'}}>
          <h2>Play Together</h2>
          <Grid container spacing={1} justifyContent={'center'}>
              <Grid item xs={4} md={3} justifyContent={'flex-end'}>
                  {friendsData.map(renderFriendItem)}
              </Grid>
              <Grid item xs={8} md={9} justifyContent={'flex-start'}>
                  {selectedFriendId && renderBusinesses(selectedFriendId)}
              </Grid>
          </Grid>
      </Container>
    </div>
  );
};