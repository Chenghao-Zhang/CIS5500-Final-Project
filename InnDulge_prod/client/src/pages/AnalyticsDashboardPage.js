import React, { useState, useEffect } from 'react';
import { Select, FormControl, InputLabel, MenuItem, Container, Grid, Typography, Box, Rating } from '@mui/material';
import { PieChart, Pie, Cell, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Bar } from 'recharts';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
// https://mui.com/x/react-date-pickers/adapters-locale/
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import moment from 'moment';
import { DataGrid } from '@mui/x-data-grid';
const config = require('../config.json');

export default function AnalyticsDashboardPage () {
  const [businessData, setBusinessData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [monthlyReviewsData, setMonthlyReviewsData] = useState([]);
  const [selectedYearForReviews, setSelectedYearForReviews] = useState(moment().format('YYYY'));
  const [selectedYearMonthForBA, setSelectedYearMonthForBA] = useState(moment().format('YYYY-MM'));
  const [selectedBusiness, setSelectedBusiness] = useState(1);
  const [userPreferences, setUserPreferences] = useState([]);
  const [dailyReviews, setDailyReviews] = useState([]);
  const [avgStars, setAvgStars] = useState(0);
  const [loyalCustomers, setLoyalCustomers] = useState([]);
  const [reviewTypeCount, setReviewTypeCount] = useState([]);
  
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/ba/popular/category`)
    .then(res => res.json())
    .then(resJson => {
        setCategoriesData(resJson['categories']);
    });

    fetch(`http://${config.server_host}:${config.server_port}/ba/business/list`)
    .then(res => res.json())
    .then(resJson => {
        setBusinessData(resJson);
    });
  }, [])

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/ba/reviews/count/${selectedYearForReviews}`)
    .then(res => res.json())
    .then(resJson => {
        setMonthlyReviewsData(resJson['reviews_count']);
    });
  }, [selectedYearForReviews]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/ba/analysis/${selectedBusiness}/${selectedYearMonthForBA}`)
    .then(res => res.json())
    .then(resJson => {
        setAvgStars(resJson['avg_stars']['avg_stars']);
        setDailyReviews(resJson['daily_reviews']);
        setUserPreferences(resJson['user_preferences']);
    });
  }, [selectedBusiness, selectedYearMonthForBA]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/ba/loyal_customers/${selectedBusiness}`)
    .then(res => res.json())
    .then(resJson => {
        setLoyalCustomers(resJson);
    });

    fetch(`http://${config.server_host}:${config.server_port}/ba/review_type_count/${selectedBusiness}`)
    .then(res => res.json())
    .then(resJson => {
        setReviewTypeCount(resJson);
    });
  }, [selectedBusiness]);


    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
    };

  function getRandomColor() {
    const randomR = Math.floor(Math.random() * 256);
    const randomG = Math.floor(Math.random() * 256);
    const randomB = Math.floor(Math.random() * 256);
    const colorHex = ((1 << 24) + (randomR << 16) + (randomG << 8) + randomB).toString(16).slice(1);
  
    return `#${colorHex}`;
  }

  const handleYearMonthChange = (value) => {
    setSelectedYearMonthForBA(format(value, 'yyyy-MM'));
  };

  const columns = [
    { field: 'user_id', headerName: 'User ID'},
    { field: 'userName', headerName: 'Name'},
    { field: 'positiveReviewCount', headerName: 'Positive Count', width:150 },
    { field: 'firstPositiveReview', headerName: 'First Positive Review', width:200 },
    { field: 'latestPositiveReview', headerName: 'Latest Positive Review', width:200 },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt:3 }}>
    <Grid container spacing={1} justifyContent="center">
    <Grid item xs={6} md={4} display="flex" alignItems="center" justifyContent="center">
        <div style={{ position: 'relative' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1em' }}>Popular Business Categories</h3>
            <PieChart width={300} height={300}>
                <Pie
                    data={categoriesData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                >
                    {categoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getRandomColor()} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </div>
    </Grid>

    <Grid item xs={6} md={8} display="flex" alignItems="center" justifyContent="center">
        <Box width="100%">
        <FormControl>
            <InputLabel id="year-select-label">Year</InputLabel>
            <Select
            sx={{
                width: '100px',
            }}
            labelId="year-select-label"
            value={selectedYearForReviews}
            onChange={(e) => setSelectedYearForReviews(parseInt(e.target.value))}
            >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
            </Select>
        </FormControl>
        </Box>
        <div style={{ position: 'relative' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '1em' }}>Business Reviews</h3>
        <Box mt={2} width="100%">
        <BarChart width={730} height={250} data={monthlyReviewsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_reviews" fill="#8884d8" />
        </BarChart>
        </Box>
        </div>
    </Grid>
    

    <Grid item xs={6} md={12} display="flex" alignItems="center" justifyContent="center" sx={{mt:6}}>
        <Box width="100%">
        <h2 style={{ textAlign: 'center', marginBottom: '1em' }}>Business Analysis</h2>
        </Box>
    </Grid>
    <Grid item xs={6} md={4} display="flex" alignItems="center" justifyContent="center">
        <Box width="100%">
        <FormControl>
            <InputLabel id="b-select-label">Business</InputLabel>
            <Select
            sx={{
                width: '200px',
            }}
            labelId="b-select-label"
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(parseInt(e.target.value))}
            >
            {businessData.map((b) => (
                <MenuItem key={b.name} value={parseInt(b.value)}>{b.name}</MenuItem>
            ))}
            </Select>
        </FormControl>
        </Box>
    </Grid>

    <Grid item xs={6} md={4} display="flex" alignItems="center" justifyContent="center">
        <Box width="100%">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
            views={['year', 'month']}
            label="Year and Month"
            value={moment(selectedYearMonthForBA, 'YYYY-MM').toDate()}
            onChange={handleYearMonthChange}
        />
        </LocalizationProvider>
        </Box>
    </Grid>
    <Grid item xs={6} md={4} display="flex" alignItems="center" justifyContent="center">
        <Typography variant="body1">
          Average Stars in {selectedYearMonthForBA}: 
          <Rating
              name="average-stars"
              value={Number(avgStars)}
              precision={0.1}
              size="small"
              readOnly
          />
        </Typography>
    </Grid>

    <Grid item xs={6} md={6} display="flex" alignItems="center" justifyContent="center">
        <div style={{ position: 'relative' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '1em' }}>Daily Reviews in {selectedYearMonthForBA}</h3>
        <LineChart
            width={500}
            height={300}
            data={dailyReviews}
            margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
            }}
            >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="daily_reviews" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
        </div>
    </Grid>

    <Grid item xs={6} md={6} display="flex" alignItems="center" justifyContent="center">
        <div style={{ position: 'relative' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1em' }}>User Preference in {selectedYearMonthForBA}</h3>
            <PieChart width={400} height={400}>
                <Pie
                    data={userPreferences}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    label={renderCustomizedLabel}
                >
                    {userPreferences.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getRandomColor()} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </div>
    </Grid>

    <Grid item xs={6} md={12} display="flex" alignItems="center" justifyContent="center">
        <Box>
        <h3 style={{ width:'1000px', textAlign: 'center', marginBottom: '1em' }}>Top 10 Loyal Customers</h3>
        <DataGrid width={1000} rows={loyalCustomers || []} columns={columns} pageSize={10} autoHeight />
        </Box>
    </Grid>

    <Grid item xs={6} md={12} display="flex" alignItems="center" justifyContent="center">
        <div style={{ position: 'relative' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1em' }}>Reviews Count by Type</h3>
            <Box mt={2} width="100%">
            <BarChart width={730} height={250} data={reviewTypeCount}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="reviewType" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
            </Box>
        </div>
    </Grid>

    </Grid>
    </Container>
);};