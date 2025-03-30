import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CssBaseline, Typography } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { verifyAuth } from './redux/slices/authSlice';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './components/home/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TripBot from './components/tripbot/TripBot';
import AdminDashboard from './components/admin/AdminDashboard';
import Accomodation from './components/accommodations/Accommodation';
import AccommodationUpdt from './components/accommodations/AccommodationUpdt';
import AccommodationEdit from './components/accommodations/AccommodationEdit';
import Profile from './components/profile/Profile';
import AdminGuides from './components/tours/AdminGuides';
import TourGuides from './components/tours/UserGuides';

// Protected Route Components
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && (!user?.role || !allowedRoles.includes(user.role))) {
    return <Navigate to="/" />;
  }

  return children;
};

// Placeholder components for team sections
const DestinationManagement = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4">Destination Management</Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>This section is under development by Team Member 1</Typography>
  </Box>
);

const AccommodationManagement = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4">Accommodation Management</Typography>
    <Accomodation/>
  </Box>
);

const TourManagement = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4">Tour Package Management</Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>This section is under development by Team Member 3</Typography>
  </Box>
);

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    // Verify authentication when app loads
    if (localStorage.getItem('token')) {
      dispatch(verifyAuth());
    }
  }, [dispatch]);

  // Hide footer on TripBot page
  const shouldShowFooter = location.pathname !== '/tripbot';

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        bgcolor: location.pathname === '/tripbot' ? '#f5f5f5' : 'background.default'
      }}
    >
      <CssBaseline />
      <Navbar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/acc-updt" element={<AccommodationUpdt />} />
          <Route path="/edit-accommodation" element={<AccommodationEdit />} />
          {/* Protected Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tripbot" 
            element={
              <ProtectedRoute>
                <TripBot />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/admin/destinations"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DestinationManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/accommodations"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AccommodationManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tours"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TourManagement />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin/tours/addguides" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminGuides />
              </ProtectedRoute>
            } 
          />
        
        <Route 
            path="/tours/tourguides" 
            element={
              <ProtectedRoute>
                <TourGuides />
              </ProtectedRoute>
            } 
          />
          </Routes>
      </Box>
      {shouldShowFooter && <Footer />}
    </Box>
  );
}

export default App;
