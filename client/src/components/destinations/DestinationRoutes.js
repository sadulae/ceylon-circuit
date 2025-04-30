import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DestinationList from './DestinationList';
import DestinationDetail from './DestinationDetail';
import DestinationForm from './DestinationForm';
import { useSelector } from 'react-redux';
import AdminLayout from '../admin/AdminLayout';

const DestinationRoutes = () => {
  const { user } = useSelector(state => state.auth);
  const isAdmin = user && user.role === 'admin';

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isAdmin) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Routes>
      {/* Admin routes */}
      <Route 
        path="/admin/destinations" 
        element={
          <ProtectedRoute>
            <AdminLayout>
              <DestinationList isAdmin={true} />
            </AdminLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/destinations/create" 
        element={
          <ProtectedRoute>
            <AdminLayout>
              <DestinationForm />
            </AdminLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/destinations/edit/:id" 
        element={
          <ProtectedRoute>
            <AdminLayout>
              <DestinationForm />
            </AdminLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/destinations/:id" 
        element={
          <ProtectedRoute>
            <AdminLayout>
              <DestinationDetail isAdmin={true} />
            </AdminLayout>
          </ProtectedRoute>
        } 
      />

      {/* Public routes */}
      <Route path="/destinations" element={<DestinationList />} />
      <Route path="/destinations/:id" element={<DestinationDetail />} />
    </Routes>
  );
};

export default DestinationRoutes; 