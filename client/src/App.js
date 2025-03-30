import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Fixed spelling
import { Box, Container, CssBaseline, Typography } from '@mui/material';
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
import Profile from './components/profile/Profile';
import CreateDestination from './components/CreateDestination';

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

// Placeholder components
const DestinationManagement = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4">Destination Management</Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>This section is under development</Typography>
  </Box>
);

const AccommodationManagement = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4">Accommodation Management</Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>This section is under development</Typography>
  </Box>
);

const TourManagement = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4">Tour Package Management</Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>This section is under development</Typography>
  </Box>
);

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(verifyAuth());
    }
  }, [dispatch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/createdestination" element={<CreateDestination />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/tripbot" element={<ProtectedRoute><TripBot /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/destinations" element={<ProtectedRoute allowedRoles={['admin']}><DestinationManagement /></ProtectedRoute>} />
          <Route path="/admin/accommodations" element={<ProtectedRoute allowedRoles={['admin']}><AccommodationManagement /></ProtectedRoute>} />
          <Route path="/admin/tours" element={<ProtectedRoute allowedRoles={['admin']}><TourManagement /></ProtectedRoute>} />
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
}

export default App;