import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  Alert
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '../../redux/slices/authSlice';

const AdminDashboard = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  const teamSections = [
    {
      title: "Destination Management",
      description: "Manage destinations, attractions, and points of interest.",
      route: "/admin/destinations",
      developer: "Team Member 1",
      status: "In Development"
    },
    {
      title: "Accommodation Management",
      description: "Manage hotels, guesthouses, and other accommodation options.",
      route: "/admin/accommodations",
      developer: "Team Member 2",
      status: "In Development"
    },
    {
      title: "Tour Package Management",
      description: "Create and manage tour packages and itineraries.",
      route: "/admin/tours",
      developer: "Team Member 3",
      status: "In Development"
    }
  ];

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)', // Account for navbar height
        backgroundColor: '#f5f5f5',
        pt: 8, // Add padding top to account for navbar
        pb: 6,
        mt: '64px' // Add margin top equal to navbar height
      }}
    >
      <Container maxWidth="lg">
        {/* Welcome Message */}
        <Alert 
          severity="success" 
          sx={{ 
            mb: 4,
            '& .MuiAlert-message': {
              fontSize: '1.1rem'
            }
          }}
        >
          Welcome back, Admin! You're logged in as {user?.firstName} {user?.lastName}
        </Alert>

        {/* Admin Dashboard Header */}
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 4,
            color: '#0E374E',
            fontWeight: 600,
            textAlign: 'center'
          }}
        >
          Ceylon Circuit Admin Dashboard
        </Typography>

        {/* Team Sections Grid */}
        <Grid container spacing={4}>
          {teamSections.map((section, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardHeader
                  title={section.title}
                  sx={{
                    backgroundColor: '#4FD1C5',
                    color: 'white',
                    '& .MuiCardHeader-title': {
                      fontSize: '1.25rem',
                      fontWeight: 600
                    }
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" paragraph>
                    {section.description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="textSecondary">
                    Developer: {section.developer}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Status: {section.status}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: '#0E374E',
                      '&:hover': {
                        backgroundColor: '#0a2a3c'
                      }
                    }}
                    onClick={() => navigate(section.route)}
                  >
                    Access Section
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Stats Section */}
        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              color: '#0E374E',
              fontWeight: 600
            }}
          >
            Quick Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: '#fff',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" color="primary">
                  Total Destinations
                </Typography>
                <Typography variant="h4">0</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: '#fff',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" color="primary">
                  Active Tours
                </Typography>
                <Typography variant="h4">0</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: '#fff',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" color="primary">
                  Accommodations
                </Typography>
                <Typography variant="h4">0</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: '#fff',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" color="primary">
                  Total Users
                </Typography>
                <Typography variant="h4">0</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminDashboard; 