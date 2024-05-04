import React, { useState, useEffect } from 'react';
import { Box, Button, Modal, Typography, Rating, Stack} from '@mui/material';
import BusinessRecommendation from './BusinessRecommendation'
import Slider from 'react-slick';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import RevieweForm from './ReviewForm';
import EntityReviews from './EntityReviews'
import { loginUser } from '../helpers/cookie';

import Map from './map/src/App';  


const config = require('../config.json');

export default function ResidenceCard({ residenceId, handleClose }) {
  function formatPrice(price) {
    return `$${Number(price).toFixed(2)}`;
  }

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <KeyboardArrowLeftIcon color="action"/>,
    nextArrow: <KeyboardArrowRightIcon color="action"/>,
  };

  const [residenceDataLoaded, setResidenceDataLoaded] = useState(false);
  const [residencePicsLoaded, setResidencePicsLoaded] = useState(false);
  const [residenceData, setResidenceData] = useState({});
  const [residencePics, setResidencePics] = useState([]);
  const [recommendedBusinesses, setRecommendedBusinesses] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleReviewClick = () => {
    setIsReviewModalOpen(true);
  };


  useEffect(() => {
    Promise.all([
      fetch(`http://${config.server_host}:${config.server_port}/residence/${residenceId}`)
        .then(res => res.json())
        .then(resJson => {
          setResidenceData(resJson);
          setResidenceDataLoaded(true);
        }),
      fetch(`http://${config.server_host}:${config.server_port}/photo?id=${residenceId}&entity=residence`)
        .then(res => res.json())
        .then(resJson => {
          setResidencePics(resJson);
          setResidencePicsLoaded(true);
        }),
      fetch(`http://${config.server_host}:${config.server_port}/recommend/business?id=${residenceId}`)
      .then(res => res.json())
      .then(recommendedJson => {
        setRecommendedBusinesses(recommendedJson);
        }),
    ]).catch(error => console.error("Failed to fetch data:", error));
  }, [residenceId]);

  if (!residenceDataLoaded || !residencePicsLoaded) {
    return (
      <Box>Loading...</Box>
    );
  }
  
  return (
    <Modal
      open={true}
      onClose={handleClose}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', maxHeight: 700 }}
    >
      <Box
        p={3}
        style={{
          background: 'white',
          // borderRadius: '16px',
          border: '3px solid #000',
          width: '60%',
          height: '90vh',
          textAlign: 'left',
          overflowWrap: 'break-word',
          overflowY: 'auto',
          overflowX: 'auto',
          marginTop: '20vh',
        }}
      >
        <Typography variant="h4">{residenceData.name}</Typography>

        <br />

        <Typography variant="subtitle1">
          <span style={{ fontWeight: 'bold' }}>Address: </span> 
          {residenceData.address}, 
          {residenceData.city}, 
          {residenceData.state}
        </Typography>
        <Typography variant="body1">
          <span style={{ fontWeight: 'bold' }}>Property Type: </span> 
          {residenceData.property_type}
        </Typography>
        <Typography variant="body1">
          <span style={{ fontWeight: 'bold' }}>Stars: </span>
          <Rating
              name="average-stars"
              value={Number(residenceData.stars)}
              precision={0.1}
              size="small"
              readOnly
          /> <span>({residenceData.review_count} reviews)</span>
        </Typography>
        <Typography variant="body1">
          <span style={{ fontWeight: 'bold' }}>Bedrooms:</span> {residenceData.bedrooms} <br />
          <span style={{ fontWeight: 'bold' }}>Bathrooms:</span> {residenceData.bathrooms} <br />
          <span style={{ fontWeight: 'bold' }}>Beds:</span> {residenceData.beds}
        </Typography>
        <Typography variant="body1">
          <span style={{ fontWeight: 'bold' }}>Price: </span>
          {formatPrice(residenceData.price)}
        </Typography>

        <br />

        <Typography variant="body1" gutterBottom>
          {residenceData.description}
        </Typography>
        {residencePics && residencePics.length > 0 && (
        <Slider {...settings}>
          {residencePics.map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
              <img src={item.file_path} alt={item.caption} style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }} />
            </div>
          ))}
        </Slider>)}

        <EntityReviews entityId = {residenceId} entityType={'airbnb'}/>

        
        {/* <Map markers={markers} /> */}
        <Map recommendedBusinesses={recommendedBusinesses} residenceData={residenceData}/> 


        <BusinessRecommendation recommendedBusinesses={recommendedBusinesses} />

        <Stack
        direction="row"
        justifyContent="flex-end"
        textAlign="center"
        spacing={3}
        sx={{ alignSelf: 'flex-end', mt:5 }}
        >
            <Button variant="contained" color="primary" onClick={handleReviewClick}>
              Review
            </Button>
            <Button variant="contained" color="primary" onClick={handleClose}>Close</Button>
        </Stack>
        <RevieweForm 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        user_id={loginUser().userId}
        entityId={residenceId}
        entityType={'airbnb'}
        />
      </Box>
    </Modal>
  );
}