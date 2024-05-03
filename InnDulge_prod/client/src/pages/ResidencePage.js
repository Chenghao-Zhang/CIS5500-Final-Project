import { useEffect, useState } from 'react';
import background from '../img/bkg.png';
import { Button, Container, Grid, Link, Select, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import { loginUser } from '../helpers/cookie';
import ResidenceCard from '../components/ResidenceCard';
const config = require('../config.json');

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function ResidencePage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [selectedResidenceId, setSelectedResidenceId] = useState(null);
  const [name, setName] = useState('');
  const [bathrooms, setBathrooms] = useState([1, 10]);
  const [bedrooms, setBedrooms] = useState([1, 10]);
  const [price, setPrice] = useState([0, 3000]);
  const [property, setProperty] = useState([]);
  const [allProperty, setAllProperty] = useState([]);

  // Load Airbnb Property types
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/airbnb/property`)
      .then(res => res.json())
      .then(resJson => {
        setAllProperty(resJson['propertyTypes']);
      });
  }, []);

  // useEffect(() => {
  //   fetch(`http://${config.server_host}:${config.server_port}/search_residence`)
  //     .then(res => res.json())
  //     .then(resJson => {
  //       const residenceWithId = resJson.map((residence) => ({ id: residence.airbnb_id, ...residence }));
  //       setData(residenceWithId);
  //     });
  // }, []);

  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/search/residence?name=${name}` +
      `&min_bathrooms=${bathrooms[0]}&max_bathrooms=${bathrooms[1]}` +
      `&min_bedrooms=${bedrooms[0]}&max_bedrooms=${bedrooms[1]}` +
      `&min_price=${price[0]}&max_price=${price[1]}` +
      `&property=${property}&user_id=${loginUser().userId}`
    )
      .then(res => res.json())
      .then(resJson => {
        const residenceWithId = resJson.map((residence) => ({ id: residence.airbnb_id, ...residence }));
        setData(residenceWithId);
      });
  }

  const columns = [
    { field: 'name', headerName: 'Name', width: 300, renderCell: (params) => (
        <Link onClick={() => setSelectedResidenceId(params.row.airbnb_id)}>{params.value}</Link>
    ) },
    { field: 'stars', headerName: 'Stars' },
    { field: 'review_count', headerName: 'Review Count' },
    { field: 'bathrooms', headerName: 'Bathrooms' },
    { field: 'bedrooms', headerName: 'Bedrooms' },
    { field: 'beds', headerName: 'Beds' },
    { field: 'price', headerName: 'Price' },
    { field: 'property_type', headerName: 'Property Type' },
    { field: 'description', headerName: 'Description' },
  ]
  
  return (
    <div style={{ backgroundImage: `url(${background})`, height: '100vh', backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center', overflow: 'auto' }}>
      <Container style={{backgroundColor: 'rgba(255, 255, 255, 0.85)', overflow: 'auto'}}>
        {selectedResidenceId && (
          <ResidenceCard
            residenceId={selectedResidenceId}
            handleClose={() => setSelectedResidenceId(null)}
          />
        )}
        <h2>Search Residence</h2>
        <Grid container spacing={5} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Grid container spacing={5} direction="column">
              <Grid item>
                <TextField
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: "100%", marginTop: "-16px" }}
                />
              </Grid>
              <Grid item>
                <InputLabel id="property-label">Property</InputLabel>
                <Select
                  labelId="property-label"
                  multiple
                  value={property}
                  MenuProps={MenuProps}
                  onChange={(e) => setProperty(e.target.value)}
                  style={{ width: "100%" }}
                >
                  {allProperty.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={() => search()}
              style={{ width: "100%" }}
            >
              Search
            </Button>
          </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Grid container spacing={1} direction="column">
              <Grid item>
                <p>Bathroom</p>
                <Slider
                  value={bathrooms}
                  min={1}
                  max={10}
                  step={1}
                  onChange={(e, newValue) => setBathrooms(newValue)}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => <div>{value}</div>}
                />
              </Grid>
              <Grid item>
                <p>Bedrooms</p>
                <Slider
                  value={bedrooms}
                  min={1}
                  max={10}
                  step={1}
                  onChange={(e, newValue) => setBedrooms(newValue)}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => <div>{value}</div>}
                />
              </Grid>
              <Grid item>
                <p>Price</p>
                <Slider
                  value={price}
                  min={0}
                  max={3000}
                  step={1}
                  onChange={(e, newValue) => setPrice(newValue)}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => <div>{value}</div>}
                />
              </Grid>
            </Grid>
          </Grid>

        </Grid>
        <h2>Results</h2>
        <DataGrid
          rows={data}
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 25]}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          autoHeight
        />
      </Container>
    </div>
  );
}