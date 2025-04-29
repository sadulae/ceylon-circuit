import React, { useEffect, useState } from 'react';
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
  Alert,
  CircularProgress,
  LinearProgress,
  Stack,
  Tooltip
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '../../redux/slices/authSlice';
import { fetchDestinations } from '../../redux/slices/destinationSlice';
import { fetchTours } from '../../redux/slices/tourSlice';
import { fetchAccommodations } from '../../redux/slices/accSlice';
import axios from 'axios';

const AdminDashboard = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Select data from Redux store
  const { destinations } = useSelector(state => state.destinations);
  const { tours } = useSelector(state => state.tours);
  const { accommodations } = useSelector(state => state.accommodations);
  
  // Local state for statistics
  const [stats, setStats] = useState({
    destinations: 0,
    tours: 0,
    accommodations: 0,
    users: 0,
    loading: true,
    completionRates: {
      destinationsWithImages: 0,
      destinationsWithFullInfo: 0,
      toursWithItineraries: 0
    },
    regionStats: [],
    districtStats: {}
  });
  
  // Fetch all required data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from Redux slices
        await dispatch(fetchDestinations());
        await dispatch(fetchTours());
        await dispatch(fetchAccommodations());
        
        // Fetch user count from API
        // Since we don't have a dedicated user slice yet, we'll use axios directly
        try {
          const token = localStorage.getItem('token');
          const userResponse = await axios.get('http://localhost:5000/api/users/count', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const userCount = userResponse.data.count || 0;
          
          setStats(prev => ({
            ...prev,
            loading: false,
            users: userCount
          }));
        } catch (userError) {
          console.error('Error fetching user count:', userError);
          // Continue without user count data
          setStats(prev => ({
            ...prev,
            loading: false,
            users: 'N/A'
          }));
        }
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
        setStats(prev => ({
          ...prev,
          loading: false
        }));
      }
    };
    
    fetchData();
  }, [dispatch]);
  
  // Log data structure for debugging
  useEffect(() => {
    console.log('Redux store data structure:');
    console.log('Destinations:', destinations);
    console.log('Tours:', tours);
    console.log('Accommodations:', accommodations);
  }, [destinations, tours, accommodations]);
  
  // Update stats when redux data changes
  useEffect(() => {
    // Ensure we have data and check its structure
    if (destinations && tours && accommodations) {
      try {
        // Calculate completion rates for destinations
        const destinationsWithImages = Array.isArray(destinations) ? 
          destinations.filter(d => d.mainImage || (d.images && d.images.length > 0)).length : 0;
        
        const destinationsWithFullInfo = Array.isArray(destinations) ? 
          destinations.filter(d => 
            d.description && 
            d.location && 
            d.location.address && 
            (d.mainImage || (d.images && d.images.length > 0))
          ).length : 0;
        
        // For tours, check if it's an array or has a tours property that's an array
        let toursArray = null;
        if (Array.isArray(tours)) {
          toursArray = tours;
        } else if (tours && typeof tours === 'object' && Array.isArray(tours.tours)) {
          toursArray = tours.tours;
        }
        
        const toursWithItineraries = toursArray ? 
          toursArray.filter(t => t && t.itinerary && Array.isArray(t.itinerary) && t.itinerary.length > 0).length : 0;
        
        // Calculate region distribution for destinations
        const regions = {};
        
        // Calculate district distribution
        const districts = {};
        
        destinations.forEach(dest => {
          if (dest && dest.location) {
            // For province stats
            const province = dest.location.province || 'Unknown';
            if (!regions[province]) {
              regions[province] = 0;
            }
            regions[province]++;
            
            // For district stats
            if (dest.location.district) {
              const districtName = dest.location.district.trim();
              if (!districts[districtName]) {
                districts[districtName] = 0;
              }
              districts[districtName]++;
            }
          }
        });
        
        // Convert to array for display
        const regionStats = Object.entries(regions)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Top 5 regions
        
        // Determine the correct count of items
        const destinationsCount = Array.isArray(destinations) ? destinations.length : 0;
        const toursCount = toursArray ? toursArray.length : 0;
        const accommodationsCount = Array.isArray(accommodations) ? 
          accommodations.length : 
          (accommodations && Array.isArray(accommodations.accommodations) ? accommodations.accommodations.length : 0);
        
        setStats(prev => ({
          ...prev,
          destinations: destinationsCount,
          tours: toursCount,
          accommodations: accommodationsCount,
          completionRates: {
            destinationsWithImages: destinationsWithImages,
            destinationsWithFullInfo: destinationsWithFullInfo,
            toursWithItineraries: toursWithItineraries
          },
          regionStats,
          districtStats: districts
        }));
      } catch (error) {
        console.error('Error processing stats data:', error);
        setStats(prev => ({
          ...prev,
          loading: false
        }));
      }
    }
  }, [destinations, tours, accommodations]);

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              color: '#0E374E',
              fontWeight: 600
            }}
          >
            Quick Statistics
          </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>
          
          {stats.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: '#fff',
                    borderRadius: 2,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 3
                    }
                }}
              >
                <Typography variant="h6" color="primary">
                  Total Destinations
                </Typography>
                  <Typography variant="h2" sx={{ my: 2, fontWeight: 'bold' }}>
                    {stats.destinations}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => navigate('/admin/destinations')}
                  >
                    View All
                  </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: '#fff',
                    borderRadius: 2,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 3
                    }
                }}
              >
                <Typography variant="h6" color="primary">
                  Active Tours
                </Typography>
                  <Typography variant="h2" sx={{ my: 2, fontWeight: 'bold' }}>
                    {stats.tours}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => navigate('/admin/tours')}
                  >
                    View All
                  </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: '#fff',
                    borderRadius: 2,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 3
                    }
                }}
              >
                <Typography variant="h6" color="primary">
                  Accommodations
                </Typography>
                  <Typography variant="h2" sx={{ my: 2, fontWeight: 'bold' }}>
                    {stats.accommodations}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => navigate('/admin/accommodations')}
                  >
                    View All
                  </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: '#fff',
                    borderRadius: 2,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 3
                    }
                }}
              >
                <Typography variant="h6" color="primary">
                  Total Users
                </Typography>
                  <Typography variant="h2" sx={{ my: 2, fontWeight: 'bold' }}>
                    {stats.users}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => navigate('/admin/users')}
                  >
                    View All
                  </Button>
                </Paper>
              </Grid>
              
              {/* Sri Lanka District Map */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Destination Distribution by District
                    </Typography>
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {Object.entries(stats.districtStats).map(([district, count]) => (
                        <Box
                          key={district}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '&:last-child': {
                              borderBottom: 'none'
                            }
                          }}
                        >
                          <Typography variant="body1">
                            {district}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {count} destinations
                            </Typography>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: count > 0 ? 'success.main' : 'grey.300'
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Content Completion Stats */}
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    backgroundColor: '#fff',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h6" color="primary" gutterBottom>
                    Content Completion Rates
                  </Typography>
                  
                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Destinations with Images</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {typeof stats.destinations === 'number' && stats.destinations > 0 ? 
                          Math.round((stats.completionRates.destinationsWithImages / stats.destinations) * 100) : 0}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={typeof stats.destinations === 'number' && stats.destinations > 0 ? 
                        (stats.completionRates.destinationsWithImages / stats.destinations) * 100 : 0
                      } 
                      sx={{ height: 8, borderRadius: 5, mb: 2 }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Destinations with Complete Info</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {typeof stats.destinations === 'number' && stats.destinations > 0 ? 
                          Math.round((stats.completionRates.destinationsWithFullInfo / stats.destinations) * 100) : 0}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={typeof stats.destinations === 'number' && stats.destinations > 0 ? 
                        (stats.completionRates.destinationsWithFullInfo / stats.destinations) * 100 : 0
                      } 
                      color="success"
                      sx={{ height: 8, borderRadius: 5, mb: 2 }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Tours with Complete Itineraries</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {typeof stats.tours === 'number' && stats.tours > 0 ? 
                          Math.round((stats.completionRates.toursWithItineraries / stats.tours) * 100) : 0}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={typeof stats.tours === 'number' && stats.tours > 0 ? 
                        (stats.completionRates.toursWithItineraries / stats.tours) * 100 : 0
                      } 
                      color="secondary"
                      sx={{ height: 8, borderRadius: 5 }}
                    />
                  </Box>
                </Paper>
              </Grid>
              
              {/* Regional Distribution */}
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    backgroundColor: '#fff',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h6" color="primary" gutterBottom>
                    Top Regions by Destinations
                  </Typography>
                  
                  {stats.regionStats && stats.regionStats.length > 0 ? (
                    <Box sx={{ mt: 3 }}>
                      {stats.regionStats.map((region, index) => {
                        // Calculate width as percentage of max count
                        const maxCount = stats.regionStats[0].count;
                        const width = (region.count / maxCount) * 100;
                        
                        return (
                          <Box key={index} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">{region.name}</Typography>
                              <Typography variant="body2" fontWeight="bold">{region.count}</Typography>
                            </Box>
                            <Tooltip title={`${region.count} destinations in ${region.name}`}>
                              <Box 
                                sx={{ 
                                  height: 24, 
                                  width: `${width}%`, 
                                  bgcolor: index === 0 ? '#4caf50' : 
                                          index === 1 ? '#2196f3' : 
                                          index === 2 ? '#ff9800' : 
                                          index === 3 ? '#9c27b0' : '#e91e63',
                                  borderRadius: 1
                                }} 
                              />
                            </Tooltip>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      No region data available
                    </Typography>
                  )}
              </Paper>
            </Grid>
          </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default AdminDashboard; 