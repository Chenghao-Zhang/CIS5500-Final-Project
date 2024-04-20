import * as React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Stack, Paper, Box } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';

export default function HomePage() {
  return (
    <Container sx={{ py: 8 }}>
      <Paper elevation={4} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1">
          Unlock Your Dream Journey with InnDulge
        </Typography>
        <Typography variant="body1" sx={{ my: 2 }}>
          Say goodbye to scattered searches and hello to a unified travel platform that brings together your perfect stay and immersive experiences.
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <FavoriteBorderIcon color="primary" sx={{ fontSize: 36 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ mb: 1 }}>
              Personalized Recommendations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Get matched with ideal eateries, bars, and accommodations based on your taste.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ my: 4 }}>
          <LocationOnIcon color="primary" sx={{ fontSize: 36 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ mb: 1 }}>
              Seamless Integration
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Discover entertainment options around your chosen "Inn" and vice versa.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ my: 4 }}>
          <PersonPinCircleIcon color="primary" sx={{ fontSize: 36 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ mb: 1 }}>
              A Community of Adventurers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Share reviews, connect with fellow travelers, and explore shared interests.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 4 }}>
          <Button component={Link} to="/residence" variant="contained" color="primary">
            Start Exploring the Recreational Activities around Your Residence
          </Button>
          <Button component={Link} to="/business" variant="contained" color="primary">
            Start Exploring Places to Stay Near Recreational Activities
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}