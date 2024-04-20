import React, { useState } from 'react';
import { Box, Grid, Pagination, Card, CardContent, Typography, Rating } from '@mui/material';

export default function BusinessRecommendation({ recommendedBusinesses }) {
  const itemsPerPage = 3;
  const [page, setPage] = useState(1);

  const handlePageChange = (_event, newPage) => {
    setPage(newPage);
  };

  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBusinesses = recommendedBusinesses.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5">Recommendation</Typography>
      <Grid container spacing={2}>
        {currentBusinesses.map((business, index) => (
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
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Pagination
          count={Math.ceil(recommendedBusinesses.length / itemsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  );
}