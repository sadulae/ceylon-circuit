import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, Grid, Card, CardContent, CardMedia, Typography, 
  Button, TextField, Box, IconButton, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Chip, Paper,
  Divider, InputAdornment, alpha, Fade
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaceIcon from '@mui/icons-material/Place';
import FilterListIcon from '@mui/icons-material/FilterList';
import Swal from 'sweetalert2';
import { fetchDestinations, deleteDestination } from '../../redux/slices/destinationSlice';
import { getImageUrl } from '../../utils/imageUtils';

// Function to handle image errors
const handleImageError = (e) => {
  console.log('Image failed to load:', e.target.src);
  e.target.onerror = null; // Prevent infinite loop
  e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
};

const CATEGORIES = ['Beach', 'Mountain', 'Cultural', 'Wildlife', 'Historical', 'Waterfall', 'Adventure'];
const PROVINCES = ['Western', 'Central', 'Southern', 'Northern', 'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa'];

const DestinationList = ({ isAdmin = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { destinations, loading, error } = useSelector(state => state.destinations);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    dispatch(fetchDestinations());
  }, [dispatch]);

  // Debug logging for destinations
  useEffect(() => {
    if (destinations && destinations.length > 0) {
      console.log('First destination:', destinations[0]);
      console.log('Image paths:', {
        mainImage: destinations[0].mainImage,
        images: destinations[0].images
      });
    }
  }, [destinations]);

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setDeletingId(id);
          
          const resultAction = await dispatch(deleteDestination(id));
          
          if (deleteDestination.fulfilled.match(resultAction)) {
            console.log("Successfully deleted destination:", id);
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Destination has been deleted successfully.',
              confirmButtonColor: '#3085d6',
            });
            dispatch(fetchDestinations());
          } else {
            // Get the error message from the payload
            console.error('Failed to delete destination:', resultAction.error);
            
            // Check if payload has a specific message
            const errorMsg = resultAction.payload || '';
            
            if (errorMsg.includes('Admin privileges') || errorMsg.includes('not authorized')) {
              Swal.fire({
                icon: 'error',
                title: 'Access Denied',
                text: 'You need admin privileges to delete destinations.',
                confirmButtonColor: '#d33',
              });
            } else if (errorMsg.includes('Authentication') || errorMsg.includes('log in again')) {
              Swal.fire({
                icon: 'error',
                title: 'Authentication Error',
                text: 'Your session has expired. Please log in again.',
                confirmButtonColor: '#d33',
              });
              // Optional: redirect to login
              // navigate('/login');
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to delete destination: ${errorMsg || 'Please try again.'}`,
                confirmButtonColor: '#d33',
              });
            }
          }
        } catch (error) {
          console.error('Error in delete operation:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred during deletion. Please try again.',
            confirmButtonColor: '#d33',
          });
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const filteredDestinations = destinations.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (destination.description && destination.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !filterCategory || destination.category === filterCategory;
    const matchesProvince = !filterProvince || (destination.location && destination.location.province === filterProvince);
    
    return matchesSearch && matchesCategory && matchesProvince;
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ pt: 10, pb: 6, mt: { xs: 6, md: 8 } }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ pt: 10, pb: 6, mt: { xs: 6, md: 8 } }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, mb: 3, color: 'text.secondary' }}>
            The server might be down or there could be a connection issue.
          </Typography>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="center">
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => dispatch(fetchDestinations())}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Try Again
            </Button>
            {isAdmin && (
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={() => navigate('/admin/destinations/add')}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Add Destination
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Box 
      sx={{ 
        pt: { xs: 10, md: 12 }, 
        pb: 8, 
        bgcolor: '#f5f7fa',
        minHeight: '100vh'
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 4 }, 
            mb: 4, 
            borderRadius: 3,
            backgroundImage: 'linear-gradient(to right, #1976d2, #64b5f6)',
            color: 'white',
            overflow: 'hidden',
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ fontWeight: 700, textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}
            >
              {isAdmin ? 'Manage Destinations' : 'Explore Sri Lankan Destinations'}
            </Typography>
            {isAdmin && (
              <Button 
                variant="contained" 
                color="secondary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/admin/destinations/add')}
                sx={{ 
                  whiteSpace: 'nowrap',
                  bgcolor: 'white',
                  color: '#1976d2',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: alpha('#ffffff', 0.9)
                  },
                  borderRadius: 2,
                  px: 3
                }}
              >
                Add Destination
              </Button>
            )}
          </Box>
          
          {/* Search */}
          <Box mt={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search destinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { 
                  bgcolor: 'white', 
                  borderRadius: 2,
                  '& fieldset': { border: 'none' }
                }
              }}
            />
            
            <Box display="flex" justifyContent="flex-end">
              <Button 
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(prev => !prev)}
                sx={{ 
                  color: 'white', 
                  mt: 1,
                  '&:hover': {
                    bgcolor: alpha('#ffffff', 0.1)
                  } 
                }}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </Box>
          </Box>
          
          {/* Filters - with smooth height transition */}
          <Box 
            sx={{
              height: showFilters ? 'auto' : 0,
              opacity: showFilters ? 1 : 0,
              overflow: 'hidden',
              transition: 'all 0.3s ease-in-out',
              transform: showFilters ? 'translateY(0)' : 'translateY(-20px)',
              mt: showFilters ? 3 : 0
            }}
          >
            <Box 
              p={3} 
              bgcolor="white" 
              borderRadius={2} 
              boxShadow="0 4px 12px rgba(0,0,0,0.08)"
              sx={{ 
                visibility: showFilters ? 'visible' : 'hidden',
                transition: 'visibility 0.3s'
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} mb={2} color="text.primary">
                Filter Destinations
              </Typography>
              <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                <FormControl variant="outlined" sx={{ minWidth: '150px', width: { xs: '100%', sm: '50%' } }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    label="Category"
                    sx={{ borderRadius: 1 }}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {CATEGORIES.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl variant="outlined" sx={{ minWidth: '150px', width: { xs: '100%', sm: '50%' } }}>
                  <InputLabel>Province</InputLabel>
                  <Select
                    value={filterProvince}
                    onChange={(e) => setFilterProvince(e.target.value)}
                    label="Province"
                    sx={{ borderRadius: 1 }}
                  >
                    <MenuItem value="">All Provinces</MenuItem>
                    {PROVINCES.map(province => (
                      <MenuItem key={province} value={province}>{province}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button 
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => {
                    setFilterCategory('');
                    setFilterProvince('');
                  }}
                  sx={{ 
                    mr: 1,
                    borderRadius: 1,
                    textTransform: 'none'
                  }}
                >
                  Clear Filters
                </Button>
                <Button 
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => setShowFilters(false)}
                  sx={{ 
                    borderRadius: 1,
                    textTransform: 'none'
                  }}
                >
                  Apply Filters
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
        
        {/* Results Section */}
        {filteredDestinations.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="textSecondary">
              No destinations found. Please try a different search.
            </Typography>
          </Box>
        ) : (
          <>
            <Box mb={2}>
              <Typography variant="subtitle1" color="text.secondary">
                Showing {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? 's' : ''}
                {(filterCategory || filterProvince) && (
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    {filterCategory && `(Category: ${filterCategory})`} {filterCategory && filterProvince && ' '} 
                    {filterProvince && `(Province: ${filterProvince})`}
                  </Typography>
                )}
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {filteredDestinations.map(destination => (
                <Grid item xs={12} sm={6} md={4} key={destination._id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: '0 8px 15px rgba(0, 0, 0, 0.06)',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 30px rgba(0, 0, 0, 0.1)',
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="220"
                      image={getImageUrl(destination.mainImage) || getImageUrl(destination.images && destination.images[0])}
                      alt={destination.name}
                      onError={handleImageError}
                      sx={{ objectFit: 'cover' }}
                    />
                    
                    {destination.category && (
                      <Chip 
                        label={destination.category} 
                        size="small" 
                        color="primary" 
                        sx={{ 
                          position: 'absolute', 
                          top: 12, 
                          right: 12, 
                          fontWeight: 'bold',
                          bgcolor: 'white',
                          color: '#1976d2',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }} 
                      />
                    )}
                    
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
                        {destination.name}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" mb={2}>
                        <PlaceIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {destination.location && destination.location.district}, {destination.location && destination.location.province}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Typography variant="body2" color="text.secondary" sx={{ minHeight: '4.5em' }}>
                        {destination.summary ? (
                          destination.summary.length > 120 
                            ? `${destination.summary.substring(0, 120)}...` 
                            : destination.summary
                        ) : (
                          destination.description && destination.description.length > 120 
                            ? `${destination.description.substring(0, 120)}...` 
                            : destination.description || 'No description available'
                        )}
                      </Typography>
                    </CardContent>
                    
                    <Box p={2} bgcolor={alpha('#f5f7fa', 0.5)}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                        <Button 
                          component={Link} 
                          to={isAdmin ? `/admin/destinations/${destination._id}` : `/destinations/${destination._id}`}
                          variant="contained" 
                          color="primary" 
                          size="medium"
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 2
                          }}
                        >
                          View Details
                        </Button>
                        {isAdmin && (
                          <Box display="flex" gap={1}>
                            <IconButton 
                              color="primary" 
                              component={Link}
                              to={`/admin/destinations/edit/${destination._id}`}
                              size="small"
                              aria-label="edit"
                              sx={{ 
                                bgcolor: 'white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                '&:hover': {
                                  bgcolor: '#f0f7ff'
                                }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              color="error" 
                              onClick={() => handleDelete(destination._id)}
                              size="small"
                              aria-label="delete"
                              disabled={deletingId === destination._id || loading}
                              sx={{ 
                                bgcolor: 'white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                '&:hover': {
                                  bgcolor: '#fff5f5'
                                }
                              }}
                            >
                              {deletingId === destination._id ? (
                                <CircularProgress size={20} color="inherit" />
                              ) : (
                                <DeleteIcon />
                              )}
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default DestinationList; 