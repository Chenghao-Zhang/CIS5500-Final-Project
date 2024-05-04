import React, { useState, useEffect } from 'react';
import { Typography, Grid, Stack, Rating, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
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
    {/* TODO: ADD 👍 */}
  </Box>
);

function useModal() {
  const [open, setOpen] = useState(false);
  const toggleModal = () => setOpen(!open);
  
  return { open, toggleModal };
}

export default function EntityReviews({ entityId, entityType }) {
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(5);
  const url = entityType === 'business'
    ? `http://${config.server_host}:${config.server_port}/review/business/${entityId}`
    : `http://${config.server_host}:${config.server_port}/review/residence/${entityId}`;
  const { open: modalOpen, toggleModal } = useModal();

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(resJson => {
        setReviewCount(5);
        setReviews(resJson.slice(0, reviewCount));
        setAllReviews(resJson);
      });
  }, [entityId, url]);

  const AllCommentsDialog = () => (
    <Dialog open={modalOpen} onClose={toggleModal}>
      <DialogTitle>All Reviews</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} alignItems="flex-start">
          {allReviews.map((review, index) => (
            <Grid item xs={12} key={index} style={{width: 500, maxHeight:700}}>
              <CommentCard review={review} />
            </Grid>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={toggleModal}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  const handleReviewMore = () => {
    const tmp = reviewCount + 5;
    setReviewCount(tmp);
    setReviews(allReviews.slice(0, tmp));
  }

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Grid container spacing={2} justifyContent="space-between" alignItems="center">
        <Grid item xs={12} sm={6}>
          <Typography variant="h5">Reviews</Typography>
        </Grid>
      </Grid>
      <Stack direction="column" spacing={2} alignItems="flex-start">
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
        {allReviews.length > reviewCount && (
          <Grid item xs={12} sm={6}>
            <Button variant="text" onClick={handleReviewMore}>
              More ({reviewCount} / {allReviews.length})
            </Button>
          </Grid>
        )}
      <AllCommentsDialog />
    </Box>
  );
};