import { useEffect, useState } from 'react';
import background from '../img/bkg.png';
import { Button, Container, Grid, Link, Select, TextField, Checkbox } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import { loginUser } from '../helpers/cookie';
import BusinessCard from '../components/BusinessCard';
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
    )
      .then(res => res.json())
      .then(resJson => {
        const businessWithId = resJson.map((business) => ({ id: business.business_id, ...business }));
        setData(businessWithId);
      });
  }

  const columns = [
    { field: 'name', headerName: 'Name', width: 300, renderCell: (params) => (
        <Link onClick={() => setSelectedBusinessId(params.row.business_id)}>{params.value}</Link>
    ) },
    { field: 'stars', headerName: 'Stars' },
    { field: 'review_count', headerName: 'Review Count' },
    { field: 'is_open', headerName: 'Is Open', type: 'boolean' },
    { field: 'take_out', headerName: 'Take Out', type: 'boolean' },
    { field: 'parking', headerName: 'Parking', type: 'boolean' },
    { field: 'description', headerName: 'Description', flex: 1 },
  ];
  
  return (
    <div style={{ backgroundImage: `url(${background})`, height: '100vh', backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center', overflow: 'auto' }}>
      <Container style={{backgroundColor: 'rgba(255, 255, 255, 0.85)', overflow: 'auto'}}>
        {selectedBusinessId && <BusinessCard businessId={selectedBusinessId} handleClose={() => setSelectedBusinessId(null)} />}
        <h2>Search Business</h2>
        <Grid container spacing={6} justifyContent={"center"}>
          <Grid item xs={7}>
            <TextField label='Name' value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }}/>
          </Grid>
          <Grid item xs={5} direction={'row'}>
            <InputLabel id="preference-label" sx={{mr: 1}}>Only Preference</InputLabel>
            <Checkbox checked={onlyPreference}
                onChange={handleChange}
                inputProps={{ 'aria-label': 'preference only checkbox' }}/>
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