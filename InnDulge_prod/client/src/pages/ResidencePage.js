import { useEffect, useState } from 'react';
import background from '../img/bkg.png';
import { Button, Container, Grid, Link, Select, Slider, TextField, Card, CardContent, Typography, Pagination } from '@mui/material';
// import { DataGrid } from '@mui/x-data-grid';
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
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

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
        setTotalPages(Math.ceil(resJson.length / pageSize));
      });
  }

  // const columns = [
  //   { field: 'name', headerName: 'Name', width: 300, renderCell: (params) => (
  //       <Link onClick={() => setSelectedResidenceId(params.row.airbnb_id)}>{params.value}</Link>
  //   ) },
  //   { field: 'stars', headerName: 'Stars' },
  //   { field: 'review_count', headerName: 'Review Count' },
  //   { field: 'bathrooms', headerName: 'Bathrooms' },
  //   { field: 'bedrooms', headerName: 'Bedrooms' },
  //   { field: 'beds', headerName: 'Beds' },
  //   { field: 'price', headerName: 'Price' },
  //   { field: 'property_type', headerName: 'Property Type' },
  //   { field: 'description', headerName: 'Description' },
  // ]

  // Custom component to render each row as a card
  const CustomResidenceCardRow = ({ data, pageSize }) => {
    const [hoveredCard, setHoveredCard] = useState(null);

    if (data.length === 0) {
      return (
        <Grid container justifyContent="center">
          <Grid item xs={12} sm={9} md={8} lg={7} style={{ padding: "16px" }}>
            <Card style={{ width: "100%", height: "100%" }}>
              <CardContent style={{ textAlign: "center", height: "100%", alignItems: "center" }}>
                <Typography variant="h6" textAlign={'center'}>No Results</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, data.length);
    const slicedData = data.slice(startIndex, endIndex);

    // Define inline styles for the card
    const getCardStyle = (index) => ({
      transition: 'transform 0.3s',
      cursor: 'pointer',
      transform: hoveredCard === index ? 'scale(1.05)' : 'scale(1)',
    });
  
    // Event handlers
    const handleMouseEnter = (index) => {
      setHoveredCard(index);
    };
  
    const handleMouseLeave = () => {
      setHoveredCard(null);
    };

    const MAX_LINES = 8;
  
    return (
      <Grid container spacing={2} justifyContent="center">
        {slicedData.map((row, index) => (
          <Grid key={row.id} item xs={10} sm={10} md={10} lg={10}>
            <Card alignItems={"center"}
                  style={getCardStyle(index)}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  >
              <CardContent onClick={() => setSelectedResidenceId(row.airbnb_id)}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" component="div">
                      <Link>{row.name}</Link>
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography variant="body1" color="textSecondary">
                      <span style={{ fontWeight: 'bold' }}>Stars: </span>
                      {row.stars}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      <span style={{ fontWeight: 'bold' }}>Review Count: </span>
                      {row.review_count}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      <span style={{ fontWeight: 'bold' }}>Bathrooms: </span>
                      {row.bathrooms}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      <span style={{ fontWeight: 'bold' }}>Bedrooms: </span>
                      {row.bedrooms}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      <span style={{ fontWeight: 'bold' }}>Beds: </span>
                      {row.beds}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      <span style={{ fontWeight: 'bold' }}>Price: </span>
                      {row.price}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      <span style={{ fontWeight: 'bold' }}>Property Type: </span>
                      {row.property_type}
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                  <Typography variant="body1" color="textSecondary" style={{overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: MAX_LINES, WebkitBoxOrient: 'vertical', top: '16px'}}>
                    <span style={{ fontWeight: 'bold' }}>Description: </span>
                    <br /> 
                    {row.description}
                  </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangePageSize = (event) => {
    setPageSize(event.target.value);
    setPage(1);
  }

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
              <Grid item>
                <InputLabel id="page-size-label">Page Size</InputLabel>
                <Select
                  labelId="page-size-label"
                  value={pageSize}
                  onChange={handleChangePageSize}
                  style={{ width: "100%" }}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                </Select>
              </Grid>
            </Grid>
          </Grid>

        </Grid>
        <h2>Results</h2>
        {/* <DataGrid
          rows={data}
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 25]}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          autoHeight
        /> */}
        <CustomResidenceCardRow data={data} pageSize={pageSize} />
        <Grid container justifyContent="center" style={{ padding: '16px' }}>
          <Pagination count={totalPages} page={page} onChange={handleChangePage} />
        </Grid>
      </Container>
    </div>
  );
}