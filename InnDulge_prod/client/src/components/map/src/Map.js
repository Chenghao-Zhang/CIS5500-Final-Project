// Map.js
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, divIcon, point } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";

const Map = ({markers, middle}) => {


  const customIcon = new Icon({
    iconUrl: require("./img/marker-icon.png"), // Ensure this path is correct
    iconSize: [38, 38]
  });

  const createCustomClusterIcon = (cluster) => {
    return new divIcon({
      html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
      className: "custom-marker-cluster",
      iconSize: point(33, 33, true)
    });
  };

  return (
    <MapContainer center={[middle.latitude, middle.longitude]} zoom={13} className="leaflet-container">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
            <MarkerClusterGroup chunkedLoading iconCreateFunction={createCustomClusterIcon}>

          <Marker key={100} position={[middle.latitude, middle.longitude]} icon={customIcon}>
            <Popup>
              <div style={{ fontSize: "16px", fontWeight: "bold" }}>{"Your place"}</div>
            </Popup>
          </Marker>
        )
      </MarkerClusterGroup>

      <MarkerClusterGroup chunkedLoading iconCreateFunction={createCustomClusterIcon}>
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.geocode} icon={customIcon}>
            <Popup>
              <div className="custom-popup" style={{ fontSize: "16px", fontWeight: "bold" }}>{marker.name}</div>
              <div className="custom-popup" style={{ fontSize: "14px" }}>Rating: {marker.rating}</div>
              <div className="custom-popup" style={{ fontSize: "14px" }}>Review Count: {marker.review_count}</div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default Map;
