import React, { useState, useEffect } from 'react';
import { Paper, Typography, Grid, Stack, Rating } from '@mui/material';
import { Box } from '@mui/system';
const config = require('../config.json');

const CommentCard = ({ review }) => (
  <Box
    sx={{
      p: 2,
      border: '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: 2,
      marginBottom: 1,
    }}
  >
    <Typography variant="body1" component="p">
      {review.text}
    </Typography>
    <Rating
      size="small"
      value={Number(review.stars)}
      precision={0.5}
      readOnly
      sx={{ marginTop: 1 }}
    />
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ mt: 1, ml: 2, textAlign: 'right' }}
    >
      {new Date(review.date).toLocaleDateString()}
    </Typography>
  </Box>
);

export default function UserReviews({ userId }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/review/user/${userId}`)
    .then(res => res.json())
    .then(resJson => {
        setReviews(resJson);
    })
  }, [userId]);

  return (
    <Paper
      elevation={3}
      sx={{ p: 3, width: '100%', maxWidth: 800, minHeight: 300, borderRadius: 2 }}
    >
      <Stack direction="column" spacing={2} alignItems="flex-start">
        <Typography variant="h5" component="h2">
          Recent Activities
        </Typography>
        
        <Grid container spacing={2}>
          {reviews.map((review, index) => (
            <Grid item xs={12} key={index}>
              <CommentCard review={review} />
            </Grid>
          ))}
        </Grid>
        
        {reviews.length === 0 && (
          <Typography variant="body2" align="center" sx={{ my: 2 }}>
            No reviews yet
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};