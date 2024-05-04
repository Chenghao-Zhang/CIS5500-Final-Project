import { useEffect, useState } from 'react';
import background from '../img/bkg.png';
import { Button, Container, Grid, Link, Select, TextField, Checkbox, Card, CardContent, Typography, Pagination } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import { loginUser } from '../helpers/cookie';
import BusinessCard from '../components/BusinessCard';
// import { DataGrid } from '@mui/x-data-grid';
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

// TODO：Business Card
export default function BusinessPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [name, setName] = useState('');
  const [onlyPreference, setOnlyPreference] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [allCategory, setAllCategory] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [city, setCity] = useState('');

  const handleChange = (event) => {
    setOnlyPreference(event.target.checked);
  };

  // Load categories
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/business/category`)
      .then(res => res.json())
      .then(resJson => {
        setAllCategory(resJson['categories']);
      });
  }, []);

  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/search/business?name=${name}` +
      `&category=${selectedCategory}&user_id=${loginUser().userId}&only_preference=${onlyPreference}`
      + `&city=${city}`
    )
      .then(res => res.json())
      .then(resJson => {
        const businessWithId = resJson.map((business) => ({ id: business.business_id, ...business }));
        setData(businessWithId);
        setTotalPages(Math.ceil(businessWithId.length / pageSize));
      });
  }

  // const columns = [
  //   { field: 'name', headerName: 'Name', width: 300, renderCell: (params) => (
  //       <Link onClick={() => setSelectedBusinessId(params.row.business_id)}>{params.value}</Link>
  //   ) },
  //   { field: 'stars', headerName: 'Stars' },
  //   { field: 'review_count', headerName: 'Review Count' },
  //   { field: 'is_open', headerName: 'Is Open', type: 'boolean' },
  //   { field: 'take_out', headerName: 'Take Out', type: 'boolean' },
  //   { field: 'parking', headerName: 'Parking', type: 'boolean' },
  //   { field: 'description', headerName: 'Description', flex: 1 },
  // ];

  const CustomBusinessCardRow = ({data, pageSize}) => {
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

    const MAX_LINES = 6;
    
    return (
      <Grid container spacing={2} justifyContent="center">
        {slicedData.map((row, index) => (
          <Grid key={row.id} item xs={10} sm={10} md={10} lg={10} 
                onClick={() => setSelectedBusinessId(row.business_id)}>
            <Card alignItems={"center"}
                  style={getCardStyle(index)}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  >
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" component="div">
                      <Link>{row.name}</Link>
                    </Typography>
                  </Grid>
                    
                  <Grid item xs={12}>
                    {/* <Typography variant="body1" color="textSecondary">
                      Business ID: {row.business_id}
                    </Typography> */}
                    <Typography variant="body1" color="textSecondary">
                      Stars: {row.stars}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Review Count: {row.review_count}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Is Open: {row.is_open ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Take Out: {row.take_out ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Parking: {row.parking ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Address: {row.address}, {row.city}, {row.state}
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
        {selectedBusinessId && (
          <BusinessCard 
            businessId={selectedBusinessId} 
            handleClose={() => setSelectedBusinessId(null)}
          />
        )}
        <h2>Search Business</h2>
        {/* <h3>{selectedBusinessId}</h3> */}
        <Grid container spacing={2} justifyContent={"center"}>
          <Grid item xs={7}>
            <InputLabel id="Name-label" sx={{mr: 1}}>Name</InputLabel>
            <TextField label='Name' value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }}/>
          </Grid>
          <Grid item xs={5} direction={'row'}>
            <InputLabel id="preference-label" sx={{mr: 1}}>Only Preference</InputLabel>
            <Checkbox checked={onlyPreference}
                onChange={handleChange}
                inputProps={{ 'aria-label': 'preference only checkbox' }}/>
          </Grid>
          <Grid item xs={7}>
            <InputLabel id="City-label" sx={{mr: 1}}>City</InputLabel>
            <TextField label='City' value={city} onChange={(e) => setCity(e.target.value)} style={{ width: "100%" }}/>
          </Grid>
          <Grid item xs={5}>
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

          <Grid item xs={12} display="flex" alignItems="center">
            <InputLabel id="category-label" sx={{mr: 1}}>Category</InputLabel>
            <Select
              labelId='category-label'
              multiple
              value={selectedCategory}
              MenuProps={MenuProps}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {allCategory.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
        
        <Button variant="contained" onClick={() => search() } style={{ top: 15, left: '50%', transform: 'translateX(-50%)' }}>
          Search
        </Button>
        <h2>Results</h2>
        {/* <DataGrid
          rows={data}
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 25]}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          autoHeight
        /> */}
        <CustomBusinessCardRow data={data} pageSize={pageSize} />
        <Grid container justifyContent="center" style={{ padding: '16px' }}>
          <Pagination count={totalPages} page={page} onChange={handleChangePage} />
        </Grid>
      </Container>
    </div>
  );
}