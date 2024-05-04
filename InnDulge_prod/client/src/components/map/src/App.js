import React from 'react';
import Map from './Map';
import './map_styles.css';

const App = ({recommendedBusinesses, residenceData}) => {
  // const markers = [
  //   {
  //     geocode: [48.86, 2.3522],
  //     name: "Business 1",
  //     rating: 4.5
  //   },
  //   {
  //     geocode: [48.85, 2.3522],
  //     name: "Business 2",
  //     rating: 4.5
  //   }
  // ];

  const markers = recommendedBusinesses.map(business => ({
    geocode: [parseFloat(business.latitude), parseFloat(business.longitude)],
    name: business.name,
    rating: business.stars
  }));

  const middle = {latitude: residenceData.latitude, longitude: residenceData.longitude}
  return (
    <div className="map-page" id="root">
      <h1>Map</h1>
      <Map markers={markers} middle={middle}/>
    </div>
  );
};

export default App;
