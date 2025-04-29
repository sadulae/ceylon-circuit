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
import TourManagement from './components/tours/TourManagement';
import TourPackageBuilder from './components/tours/TourPackageBuilder';
import TourEdit from './components/tours/TourEdit';
import DestinationList from './components/destinations/DestinationList';
import DestinationForm from './components/destinations/DestinationForm';
import DestinationDetail from './components/destinations/DestinationDetail';

// Admin components
// Uncomment or add these imports when the components are available
// import AdminLayout from './components/admin/AdminLayout';
// import UserList from './components/admin/UserList';
// import TourList from './components/admin/TourList';
// import GuideList from './components/admin/GuideList';
// import AccommodationList from './components/admin/AccommodationList';
// import AccommodationForm from './components/admin/AccommodationForm';
// import AccommodationDetail from './components/admin/AccommodationDetail';
// import ReportList from './components/admin/ReportList';
// import Settings from './components/admin/Settings';

// Protected Route Components
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if route requires admin access
  if (allowedRoles.includes('admin') && !user?.isAdmin) {
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
                <DestinationList isAdmin={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/destinations/add"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DestinationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/destinations/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DestinationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/destinations/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DestinationDetail isAdmin={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/accommodations"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Accomodation />
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
            path="/admin/tours/create-package" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TourPackageBuilder />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tour-edit" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TourEdit />
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
          {/* Public destination routes */}
          <Route path="/destinations" element={<DestinationList />} />
          <Route path="/destinations/:id" element={<DestinationDetail />} />
          
          {/* The following Admin Layout route structure needs to be implemented once
              all the required components are available
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserList />} />
            <Route path="tours" element={<TourList />} />
            <Route path="guides" element={<GuideList />} />
            <Route path="accommodations" element={<AccommodationList />} />
            <Route path="accommodations/add" element={<AccommodationForm />} />
            <Route path="accommodations/edit/:id" element={<AccommodationForm />} />
            <Route path="accommodations/:id" element={<AccommodationDetail />} />
            <Route path="destinations" element={<DestinationList />} />
            <Route path="destinations/add" element={<DestinationForm />} />
            <Route path="destinations/edit/:id" element={<DestinationForm />} />
            <Route path="destinations/:id" element={<DestinationDetail />} />
            <Route path="reports" element={<ReportList />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          */}
          </Routes>
      </Box>
      {shouldShowFooter && <Footer />}
    </Box>
  );
}

export default App;
