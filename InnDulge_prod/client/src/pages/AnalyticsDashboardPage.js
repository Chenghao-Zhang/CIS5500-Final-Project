import React, { useState, useEffect } from 'react';
import background from '../img/bkg.png';
import { Select, FormControl, InputLabel, MenuItem, Container, Grid, Box } from '@mui/material';
import { PieChart, Pie, Cell, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar } from 'recharts';
import moment from 'moment';
import BussinessAnalysis from '../components/BusinessAnalysis';
import { getRandomColor } from '../helpers/formatter';
const config = require('../config.json');

export default function AnalyticsDashboardPage() {
  const [userInfo, setUserInfo] = useState({});
  const [categoriesData, setCategoriesData] = useState([]);
  const [monthlyReviewsData, setMonthlyReviewsData] = useState([]);
  const [selectedYearForReviews, setSelectedYearForReviews] = useState(moment().format('YYYY'));

  useEffect(() => {
    const init = async() => {
      const mUserInfo = await (await fetch(`http://${config.server_host}:${config.server_port}/user/getUserInfo`, { credentials: 'include' })).json()
      setUserInfo(mUserInfo)
      const mCategories = await (await fetch(`http://${config.server_host}:${config.server_port}/ba/popular/category`)).json()
      setCategoriesData(mCategories['categories']);
    }
    init()
  }, [])

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/ba/reviews/count/${selectedYearForReviews}`)
      .then(res => res.json())
      .then(resJson => {
        setMonthlyReviewsData(resJson['reviews_count']);
      });
  }, [selectedYearForReviews]);

  return (
    <div style={{ backgroundImage: `url(${background})`, height: '100vh', backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center', overflow: 'auto' }}>
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Grid container spacing={1} justifyContent="center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
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
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
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
          
          {/* 如果不是商户 就没这玩意使用 */}
          {userInfo.business_login && <BussinessAnalysis />}

        </Grid>
      </Container>
    </div>
  );
};