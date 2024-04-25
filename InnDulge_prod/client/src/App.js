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
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage'

// createTheme enables you to customize the look and feel of your app past the default
// in this case, we only change the color scheme
export const theme = createTheme({
  palette: {
    primary: {
      main: pink[600],
    },
    secondary: amber,
  },
});

// App is the root component of our application and as children contain all our pages
// We use React Router's BrowserRouter and Routes components to define the pages for
// our application, with each Route component representing a page and the common
// NavBar component allowing us to navigate between pages (with hyperlinks)
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
          <Route path="/ba" element={<AnalyticsDashboardPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}