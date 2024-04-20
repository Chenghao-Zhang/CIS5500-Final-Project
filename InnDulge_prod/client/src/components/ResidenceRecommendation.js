import React, { useState } from 'react';
import { Box, Grid, Pagination, Card, CardContent, Typography, Rating } from '@mui/material';

export default function ResidenceRecommendation({ recommendedResidence }) {
  const itemsPerPage = 3;
  const [page, setPage] = useState(1);

  const handlePageChange = (_event, newPage) => {
    setPage(newPage);
  };

  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentResidence = recommendedResidence.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5">Recommendation</Typography>
      <Grid container spacing={2}>
        {currentResidence.map((residence, index) => (
          <Grid item xs={12} key={index}>
            <Card sx={{ marginBottom: 2 }}>
              <CardContent>
                <Typography variant="h6">{residence.name}</Typography>
                <Typography variant="body2">
                  Address: {residence.address}, {residence.city}, {residence.state}
                </Typography>
                <Typography variant="body2">
                  Stars:
                  <Rating
                    name={`rating-${index}`}
                    value={Number(residence.stars)}
                    precision={0.1}
                    size="small"
                    readOnly
                  />
                  <span>({residence.review_count} reviews)</span>
                </Typography>
                {/* 显示更多相关业务信息 */}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Pagination
          count={Math.ceil(recommendedResidence.length / itemsPerPage)}
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