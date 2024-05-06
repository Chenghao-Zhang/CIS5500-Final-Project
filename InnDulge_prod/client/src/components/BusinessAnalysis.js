import { Box, Grid, Rating, Tooltip, Typography } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import moment from "moment"
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts"
import { format } from 'date-fns'
import { getRandomColor } from "../helpers/formatter"
const config = require('../config.json');

const BussinessAnalysis = () => {
  const [selectedYearMonthForBA, setSelectedYearMonthForBA] = useState(moment().format('YYYY-MM'));
  const [userPreferences, setUserPreferences] = useState([]);
  const [dailyReviews, setDailyReviews] = useState([]);
  const [avgStars, setAvgStars] = useState(0);
  const [loyalCustomers, setLoyalCustomers] = useState([]);
  const [reviewTypeCount, setReviewTypeCount] = useState([]);
  const [competitiveRanking, setCompetitiveRanking] = useState([]);

  const columns = [
    { field: 'id', headerName: 'User ID' },
    { field: 'userName', headerName: 'Name' },
    { field: 'positiveReviewCount', headerName: 'Positive Count', width: 150 },
    { field: 'firstPositiveReview', headerName: 'First Positive Review', width: 200 },
    { field: 'latestPositiveReview', headerName: 'Latest Positive Review', width: 200 },
  ];

  const columns_competitive_ranking = [
    { field: 'BusinessName', headerName: 'Business Name', width: 400 },
    { field: 'Category', headerName: 'Category', width: 400 },
    { field: 'Ranks', headerName: 'Rankings', width: 400 },
  ];

  const handleYearMonthChange = (value) => {
    setSelectedYearMonthForBA(format(value, 'yyyy-MM'));
  };

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/ba/analysis/${selectedYearMonthForBA}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(resJson => {
        setAvgStars(resJson['avg_stars']['avg_stars']);
        setDailyReviews(resJson['daily_reviews']);
        setUserPreferences(resJson['user_preferences']);
      });
  }, [selectedYearMonthForBA]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/ba/loyal_customers`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(resJson => {
        setLoyalCustomers(resJson);
      });

    fetch(`http://${config.server_host}:${config.server_port}/ba/review_type_count`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(resJson => {
        setReviewTypeCount(resJson);
      });
  }, []);


  useEffect(() => {
      
    fetch(`http://${config.server_host}:${config.server_port}/competitive/ranking`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(resJson => {
        // console.log("sdfs", resJson);
        setCompetitiveRanking(resJson);
      });
  }, []);

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


  return (
    <>
      <Grid item xs={6} md={12} display="flex" alignItems="center" justifyContent="center" sx={{ mt: 6 }}>
        <Box width="100%">
          <h2 style={{ textAlign: 'center', marginBottom: '1em' }}>Business Analysis</h2>
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
          <h3 style={{ width: '1000px', textAlign: 'center', marginBottom: '1em' }}>Top 10 Loyal Customers</h3>
          <DataGrid
            width={1000}
            rows={loyalCustomers || []}
            columns={columns}
            pageSize={10}
            autoHeight
          />
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

      <Grid item xs={6} md={12} display="flex" alignItems="center" justifyContent="center">
        <Box>
          <h3 style={{ width: '1000px', textAlign: 'center', marginBottom: '1em' }}>Competitive Ranking</h3>
          <DataGrid
            width={1000}
            rows={competitiveRanking || []}
            columns={columns_competitive_ranking}
            pageSize={10}
            autoHeight
            getRowId={(row) => `${row.BusinessName}-${row.Category}`}
          />
        </Box>
      </Grid>

    </>
  )
}

export default BussinessAnalysis
