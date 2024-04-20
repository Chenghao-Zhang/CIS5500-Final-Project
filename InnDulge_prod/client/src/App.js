import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { pink, amber } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import ResidencePage from "./pages/ResidencePage";
import UserProfilePage from "./pages/UserProfilePage";
import BusinessPage from "./pages/BusinessPage";
import PlayTogetherPage from './pages/PlayTogetherPage'
// import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage'

export const theme = createTheme({
  palette: {
    primary: {
      main: pink[600],
    },
    secondary: amber,
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/user/:user_id" element={<UserProfilePage />} />
          <Route path="/residence" element={<ResidencePage />} />
          <Route path="/business" element={<BusinessPage />} />
          <Route path="/together" element={<PlayTogetherPage />} />
          {/* <Route path="/ba" element={<AnalyticsDashboardPage />} /> */}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}