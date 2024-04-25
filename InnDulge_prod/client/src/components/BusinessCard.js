import React, { useState, useEffect } from 'react';
import { Box, Button, Modal, Typography, Rating, Stack} from '@mui/material';
import ResidenceRecommendation from './ResidenceRecommendation'
import Slider from 'react-slick';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import RevieweForm from './ReviewForm';
import EntityReviews from './EntityReviews'
import { loginUser } from '../helpers/cookie';

const config = require('../config.json');

export default function BusinessCard({ businessId, handleClose }) {
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

  const [businessDataLoaded, setbusinessDataLoaded] = useState(false);
  const [businessPicsLoaded, setbusinessPicsLoaded] = useState(false);
  const [businessData, setbusinessData] = useState({});
  const [businessPics, setbusinessPics] = useState([]);
  const [recommendedResidence, setRecommendedResidence] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleReviewClick = () => {
    setIsReviewModalOpen(true);
  };

  useEffect(() => {
    Promise.all([
      fetch(`http://${config.server_host}:${config.server_port}/business/${businessId}`)
        .then(res => res.json())
        .then(resJson => {
          setbusinessData(resJson);
          setbusinessDataLoaded(true);
        }),
      fetch(`http://${config.server_host}:${config.server_port}/photo?id=${businessId}&entity=business`)
        .then(res => res.json())
        .then(resJson => {
          setbusinessPics(resJson);
          setbusinessPicsLoaded(true);
        }),
      fetch(`http://${config.server_host}:${config.server_port}/recommend/residence?id=${businessId}`)
      .then(res => res.json())
      .then(recommendedJson => {
        setRecommendedResidence(recommendedJson);
        }),
    ]).catch(error => console.error("Failed to fetch data:", error));
  }, [businessId]);

  if (!businessDataLoaded || !businessPicsLoaded) {
    return (
      <Box>Loading...</Box>
    );
  }

  return (
    <Modal
      open={true}
      onClose={handleClose}
      style={{ display: 'flex', justifyContent: 'center'
      , alignItems: 'center', maxHeight: 700 }}
    >
      <Box
        p={3}
        style={{
          background: 'white',
          // borderRadius: '16px',
          border: '3px solid #000',
          width: 650,
          height:700,
          textAlign: 'left',
          overflowWrap: 'break-word',
          overflowY: 'auto',
          overflowX: 'auto',
        }}
      >
        <Typography variant="h4">{businessData.name}</Typography>
        <Typography variant="subtitle1">
          Address: {businessData.address}, {businessData.city}, {businessData.state}
        </Typography>
        <Typography variant="body1">
          Stars: 
          <Rating
              name="average-stars"
              value={Number(businessData.stars)}
              precision={0.1}
              size="small"
              readOnly
          /> <span>({businessData.review_count} reviews)</span>
        </Typography>
        <Typography variant="body1">
          {businessData.is_open===1?'Open':'Closed'}, {businessData.take_out===1?'Takeout available':'No take-out'}, {businessData.parking===1?'Parking available':'No Parking'}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {businessData.description}
        </Typography>
        {/* TODO: 照片显示bug修复 */}
        {businessPics && businessPics.length > 0 && (
        <Slider {...settings}>
          {businessPics.map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
              <img src={item.file_path} alt={item.caption} style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }} />
            </div>
          ))}
        </Slider>)}
        <EntityReviews entityId = {businessId} entityType={'business'}/>
        <ResidenceRecommendation recommendedResidence={recommendedResidence}/>
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
        entityId={businessId}
        entityType={'business'}
        />
      </Box>
    </Modal>
  );
}