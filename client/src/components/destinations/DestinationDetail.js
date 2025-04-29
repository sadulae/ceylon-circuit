import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Divider,
  Chip,
  Rating,
  Avatar,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  Tabs,
  Tab,
  ImageList,
  ImageListItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CardMedia,
  Link,
  Stack,
  Tooltip
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  Directions,
  AttachMoney,
  Star,
  Edit,
  Delete,
  Add,
  ArrowBack,
  WaterDrop,
  FormatQuote,
  Category,
  Hiking,
  Info,
  Warning,
  PlaceOutlined,
  Phone,
  Email,
  CalendarMonth,
  Lightbulb,
  LocalOffer,
  ChevronLeft,
  ChevronRight,
  EventAvailable,
  EventBusy,
  LocalAtm,
  Notes,
  EmojiFlags,
  Map,
  BeachAccess,
  SportsBasketball,
  Language
} from '@mui/icons-material';
import {
  fetchDestination,
  deleteDestination
} from '../../redux/slices/destinationSlice';
import Swal from 'sweetalert2';

const DestinationDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentDestination, loading, error } = useSelector(state => state.destinations);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  const [tabValue, setTabValue] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  const isAdmin = user && user.isAdmin;
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  
  // Fetch destination details
  useEffect(() => {
    dispatch(fetchDestination(id));
  }, [dispatch, id]);
  
  // Load Leaflet only once
  useEffect(() => {
    // Only load if not already loaded
    if (!window.L && !document.getElementById('leaflet-css') && !document.getElementById('leaflet-js')) {
      // Load Leaflet CSS
      const linkEl = document.createElement('link');
      linkEl.id = 'leaflet-css';
      linkEl.rel = 'stylesheet';
      linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      linkEl.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      linkEl.crossOrigin = '';
      document.head.appendChild(linkEl);
      
      // Load Leaflet JS
      const scriptEl = document.createElement('script');
      scriptEl.id = 'leaflet-js';
      scriptEl.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      scriptEl.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      scriptEl.crossOrigin = '';
      document.body.appendChild(scriptEl);
    }
    
    // Cleanup function
    return () => {
      // Clean up map instance when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapInitialized(false);
      }
    };
  }, []);
  
  // Initialize map when destination data and Leaflet are available
  useEffect(() => {
    // Only proceed if all dependencies are available
    if (!currentDestination || !mapRef.current || !window.L || mapInitialized) {
      return;
    }
    
    try {
      // Wait for the DOM to be fully rendered
      setTimeout(() => {
        if (!mapRef.current) return; // Safety check
        
        // Get coordinates from the mapLink or use default Sri Lanka coordinates
        let lat = 7.8731;
        let lng = 80.7718;
        
        // Try to extract coordinates from Google Maps link if available
        if (currentDestination.location?.mapLink) {
          const mapLink = currentDestination.location.mapLink;
          // Try to extract coordinates from Google Maps URL patterns
          const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
          const match = mapLink.match(regex);
          
          if (match && match.length >= 3) {
            lat = parseFloat(match[1]);
            lng = parseFloat(match[2]);
          }
        }
        
        // Clean up previous map instance if it exists
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch (e) {
            console.error("Error removing previous map:", e);
          }
          mapInstanceRef.current = null;
        }
        
        try {
          // Initialize the map with error handling
          const L = window.L;
          const map = L.map(mapRef.current, {
            attributionControl: false, // We'll add this later
            zoomControl: true
          }).setView([lat, lng], 13);
          
          mapInstanceRef.current = map;
          
          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          
          // Add a marker at the destination location
          L.marker([lat, lng]).addTo(map)
            .bindPopup(`<b>${currentDestination.name}</b><br>${currentDestination.location?.address || ''}`)
            .openPopup();
          
          // Wait for the map to be fully ready, then invalidate size
          // Use a longer timeout to ensure the map container has been fully sized
          setTimeout(() => {
            if (map && !map._isDestroyed) {
              try {
                map.invalidateSize({ animate: false });
              } catch (e) {
                console.error("Error invalidating map size:", e);
              }
            }
          }, 300);
          
          setMapInitialized(true);
        } catch (error) {
          console.error("Error initializing map:", error);
          // Show a fallback if map initialization fails
          if (mapRef.current) {
            mapRef.current.innerHTML = `
              <div style="display: flex; height: 100%; align-items: center; justify-content: center; flex-direction: column; background: #f0f7fa;">
                <div style="font-size: 24px; margin-bottom: 10px;">📍</div>
                <div>${currentDestination.location?.address || 'Location map unavailable'}</div>
              </div>
            `;
          }
        }
      }, 100);
    } catch (error) {
      console.error("Error in map effect:", error);
    }
  }, [currentDestination, mapInitialized]);
  
  // Clean up map when component unmounts or ID changes
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (e) {
          console.error("Error cleaning up map:", e);
        }
        setMapInitialized(false);
      }
    };
  }, [id]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleEditDestination = () => {
    navigate(`/admin/destinations/edit/${id}`);
  };
  
  const handleDeleteConfirm = () => {
    dispatch(deleteDestination(id)).then(() => {
      setShowDeleteDialog(false);
      Swal.fire({
        title: 'Deleted!',
        text: 'Destination has been deleted successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      navigate('/admin/destinations');
    }).catch(err => {
      setShowDeleteDialog(false);
      Swal.fire({
        title: 'Error',
        text: err.message || 'Failed to delete destination',
        icon: 'error'
      });
    });
  };
  
  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setImageDialogOpen(true);
  };
  
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? (currentDestination?.images?.length || 1) - 1 : prev - 1
    );
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === (currentDestination?.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/destinations')}
          variant="outlined"
        >
          Back to Destinations
        </Button>
      </Container>
    );
  }
  
  if (!currentDestination) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="info" sx={{ mb: 4 }}>
          Destination not found
        </Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/destinations')}
          variant="outlined"
        >
          Back to Destinations
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ pb: 8, bgcolor: '#f9fafc', minHeight: '100vh' }}>
      {/* Hero Section with Main Image */}
      <Box sx={{ position: 'relative', width: '100%', height: { xs: '40vh', md: '60vh' }, mb: 6 }}>
        {/* Main image */}
        <Box 
          sx={{ 
            height: '100%', 
            backgroundImage: `url(${currentDestination.mainImage || (currentDestination.images && currentDestination.images.length > 0 
              ? currentDestination.images[0] 
              : 'https://source.unsplash.com/random?srilanka')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}
        >
          <Box sx={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            p: 3, 
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            color: 'white'
          }}>
            <Container maxWidth="lg">
              <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {currentDestination.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {currentDestination.location?.district}, {currentDestination.location?.province || 'Sri Lanka'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<Category />} 
                  label={currentDestination.category} 
                  color="primary" 
                  sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold' }}
                />
              </Box>
            </Container>
          </Box>
        </Box>
      </Box>
      
      <Container maxWidth="lg">
        {/* Admin Actions */}
        {isAdmin && (
          <Paper sx={{ p: 2, mb: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              startIcon={<Edit />} 
              variant="contained" 
              color="primary"
              onClick={handleEditDestination}
            >
              Edit
            </Button>
            <Button 
              startIcon={<Delete />} 
              variant="contained" 
              color="error"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete
            </Button>
          </Paper>
        )}
        
        {/* Back Button */}
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/destinations')}
          sx={{ mb: 4 }}
          variant="outlined"
        >
          Back to Destinations
        </Button>
        
        <Grid container spacing={4}>
          {/* Left Column - Main Content */}
          <Grid item xs={12} md={8}>
            {/* Summary section */}
            {currentDestination.summary && (
              <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#0E374E' }}>
                  Summary
                </Typography>
                <Typography variant="body1" sx={{ fontStyle: 'italic', lineHeight: 1.8 }}>
                  {currentDestination.summary}
                </Typography>
              </Paper>
            )}
          
            {/* Description section */}
            <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: '#0E374E' }}>
                About {currentDestination.name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
                {currentDestination.description}
              </Typography>
              
              {/* Features section */}
              {currentDestination.features && currentDestination.features.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#0E374E' }}>
                    Features
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {currentDestination.features.map((feature, index) => (
                      <Chip 
                        key={index} 
                        icon={<BeachAccess />}
                        label={feature} 
                        color="primary" 
                        variant="outlined"
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
              
              {/* Tabs for more information */}
              <Box sx={{ width: '100%', mt: 4 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange} 
                    aria-label="destination information tabs"
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab label="Details" icon={<Info />} iconPosition="start" />
                    <Tab label="Visitor Information" icon={<AccessTime />} iconPosition="start" />
                    <Tab label="Travel Tips" icon={<Lightbulb />} iconPosition="start" />
                  </Tabs>
                </Box>
                
                {/* Details Tab */}
                <TabPanel value={tabValue} index={0}>
                  <List>
                    {currentDestination.location?.address && (
                      <ListItem>
                        <ListItemIcon>
                          <LocationOn color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Address" 
                          secondary={currentDestination.location.address} 
                        />
                      </ListItem>
                    )}
                    
                    {currentDestination.location?.district && (
                      <ListItem>
                        <ListItemIcon>
                          <Map color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Location" 
                          secondary={`${currentDestination.location.district}, ${currentDestination.location.province || 'Sri Lanka'}`} 
                        />
                      </ListItem>
                    )}
                    
                    {currentDestination.location?.mapLink && (
                      <ListItem>
                        <ListItemIcon>
                          <Directions color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Map" 
                          secondary={
                            <Link href={currentDestination.location.mapLink} target="_blank" rel="noopener noreferrer">
                              View on Google Maps
                            </Link>
                          } 
                        />
                      </ListItem>
                    )}
                  </List>
                </TabPanel>
                
                {/* Visitor Information Tab */}
                <TabPanel value={tabValue} index={1}>
                  <List>
                    {currentDestination.openingHours && (
                      <>
                        <ListItem>
                          <ListItemIcon>
                            <AccessTime color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Opening Hours" 
                            secondary={`${currentDestination.openingHours.open || 'N/A'} - ${currentDestination.openingHours.close || 'N/A'}`} 
                          />
                        </ListItem>
                        
                        {currentDestination.openingHours.daysClosed && currentDestination.openingHours.daysClosed.length > 0 && (
                          <ListItem>
                            <ListItemIcon>
                              <EventBusy color="error" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Closed On" 
                              secondary={
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                  {currentDestination.openingHours.daysClosed.map((day, index) => (
                                    <Chip 
                                      key={index} 
                                      label={day} 
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                    />
                                  ))}
                                </Box>
                              } 
                            />
                          </ListItem>
                        )}
                        
                        {currentDestination.openingHours.notes && (
                          <ListItem>
                            <ListItemIcon>
                              <Notes color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Additional Notes" 
                              secondary={currentDestination.openingHours.notes}
                            />
                          </ListItem>
                        )}
                      </>
                    )}
                    
                    {currentDestination.entryFee && (
                      <ListItem>
                        <ListItemIcon>
                          <LocalAtm color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Entry Fee" 
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" component="div">
                                Local: LKR {currentDestination.entryFee.local || 'Free'}
                              </Typography>
                              <Typography variant="body2" component="div">
                                Foreign: LKR {currentDestination.entryFee.foreign || 'Free'}
                              </Typography>
                              {currentDestination.entryFee.notes && (
                                <Typography variant="body2" component="div" sx={{ mt: 1, fontStyle: 'italic' }}>
                                  Note: {currentDestination.entryFee.notes}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    )}
                    
                    {currentDestination.bestTimeToVisit && (
                      <ListItem>
                        <ListItemIcon>
                          <WaterDrop color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Best Time to Visit" 
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" component="div">
                                Season: {currentDestination.bestTimeToVisit.season || 'Year Round'}
                              </Typography>
                              {currentDestination.bestTimeToVisit.months && currentDestination.bestTimeToVisit.months.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                  {currentDestination.bestTimeToVisit.months.map((month, index) => (
                                    <Chip 
                                      key={index} 
                                      label={month} 
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                    />
                                  ))}
                                </Box>
                              )}
                              {currentDestination.bestTimeToVisit.notes && (
                                <Typography variant="body2" component="div" sx={{ mt: 1, fontStyle: 'italic' }}>
                                  Note: {currentDestination.bestTimeToVisit.notes}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    )}
                  </List>
                </TabPanel>
                
                {/* Travel Tips Tab */}
                <TabPanel value={tabValue} index={2}>
                  {currentDestination.tips && currentDestination.tips.length > 0 ? (
                    <List>
                      {currentDestination.tips.map((tip, index) => (
                        <ListItem key={index} alignItems="flex-start">
                          <ListItemIcon>
                            <Lightbulb color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={`Tip ${index + 1}`}
                            secondary={tip}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                      No travel tips available for this destination.
                    </Typography>
                  )}
                </TabPanel>
              </Box>
            </Paper>
            
            {/* Gallery Section */}
            {(currentDestination.images && currentDestination.images.length > 0) && (
              <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#0E374E' }}>
                  Gallery
                </Typography>
                <Grid container spacing={2}>
                  {currentDestination.images.map((image, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          height: 200,
                          borderRadius: 2,
                          overflow: 'hidden',
                          '&:hover': {
                            boxShadow: 6,
                            transform: 'scale(1.02)',
                            transition: 'transform 0.2s ease-in-out'
                          }
                        }}
                        onClick={() => handleImageClick(index)}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={image}
                          alt={`${currentDestination.name} - image ${index + 1}`}
                          sx={{ objectFit: 'cover' }}
                        />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}
          </Grid>
          
          {/* Right Column - Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Map Card */}
            <Card sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
              <Box 
                ref={mapRef}
                sx={{ 
                  height: 300,
                  width: '100%'
                }}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {currentDestination.location?.address || `${currentDestination.location?.district}, ${currentDestination.location?.province || 'Sri Lanka'}`}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<Directions />}
                  component="a"
                  href={currentDestination.location?.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${currentDestination.name}, ${currentDestination.location?.district}, Sri Lanka`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ borderRadius: 2 }}
                >
                  Get Directions
                </Button>
              </CardContent>
            </Card>
            
            {/* Weather & Climate Card */}
            <Card sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#0E374E' }}>
                  Weather & Climate
                </Typography>
                {currentDestination.bestTimeToVisit ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <WaterDrop color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        Best Season: <strong>{currentDestination.bestTimeToVisit.season || 'Year Round'}</strong>
                      </Typography>
                    </Box>
                    {currentDestination.bestTimeToVisit.months && currentDestination.bestTimeToVisit.months.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Ideal Months:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {currentDestination.bestTimeToVisit.months.map((month, index) => (
                            <Chip 
                              key={index} 
                              label={month} 
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    {currentDestination.bestTimeToVisit.notes && (
                      <Typography variant="body2" color="text.secondary">
                        {currentDestination.bestTimeToVisit.notes}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No weather information available.
                  </Typography>
                )}
              </CardContent>
            </Card>
            
            {/* Entry Fee Card */}
            <Card sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#0E374E' }}>
                  Entry Fee
                </Typography>
                {currentDestination.entryFee ? (
                  <Box>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Card sx={{ bgcolor: '#f5f9ff', height: '100%' }}>
                          <CardContent>
                            <Typography variant="subtitle2" gutterBottom color="text.secondary">
                              Local Visitors
                            </Typography>
                            <Typography variant="h6" color="primary" fontWeight="bold">
                              LKR {currentDestination.entryFee.local || 'Free'}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card sx={{ bgcolor: '#f5f9ff', height: '100%' }}>
                          <CardContent>
                            <Typography variant="subtitle2" gutterBottom color="text.secondary">
                              Foreign Visitors
                            </Typography>
                            <Typography variant="h6" color="primary" fontWeight="bold">
                              LKR {currentDestination.entryFee.foreign || 'Free'}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                    {currentDestination.entryFee.notes && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        {currentDestination.entryFee.notes}
                      </Alert>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No entry fee information available.
                  </Typography>
                )}
              </CardContent>
            </Card>
            
            {/* Opening Hours Card */}
            <Card sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#0E374E' }}>
                  Opening Hours
                </Typography>
                {currentDestination.openingHours ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AccessTime color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        <strong>{currentDestination.openingHours.open || 'N/A'} - {currentDestination.openingHours.close || 'N/A'}</strong>
                      </Typography>
                    </Box>
                    
                    {currentDestination.openingHours.daysClosed && currentDestination.openingHours.daysClosed.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Closed on:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {currentDestination.openingHours.daysClosed.map((day, index) => (
                            <Chip 
                              key={index} 
                              label={day} 
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {currentDestination.openingHours.notes && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        {currentDestination.openingHours.notes}
                      </Alert>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No opening hours information available.
                  </Typography>
                )}
              </CardContent>
            </Card>
            
            {/* Warning Card - Enhanced */}
            <Card sx={{ mb: 4, borderRadius: 2, bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#e65100', display: 'flex', alignItems: 'center' }}>
                  <Warning sx={{ mr: 1 }} /> Important Information
                </Typography>
                <Stack spacing={2}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Warning fontSize="small" color="warning" /> Please respect local customs and traditions.
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Warning fontSize="small" color="warning" /> Take all your trash with you when leaving the area.
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Warning fontSize="small" color="warning" /> Stay hydrated and wear sun protection during your visit.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete this destination?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action cannot be undone. All information related to "{currentDestination.name}" 
            will be permanently removed from the system.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Image Viewer Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ position: 'relative', p: 0, height: '70vh' }}>
          {currentDestination.images && currentDestination.images.length > 0 && (
            <Box
              component="img"
              src={currentDestination.images[currentImageIndex]}
              alt={`${currentDestination.name} - image ${currentImageIndex + 1}`}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          )}
          
          {currentDestination.images && currentDestination.images.length > 1 && (
            <>
              <IconButton
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.8)' },
                }}
                onClick={handlePrevImage}
              >
                <ChevronLeft />
              </IconButton>
              
              <IconButton
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.8)' },
                }}
                onClick={handleNextImage}
              >
                <ChevronRight />
              </IconButton>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Typography variant="body2" sx={{ flexGrow: 1, ml: 2 }}>
            {currentImageIndex + 1} / {currentDestination.images?.length || 0}
          </Typography>
          <Button onClick={() => setImageDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`destination-tabpanel-${index}`}
      aria-labelledby={`destination-tab-${index}`}
      {...other}
      style={{ padding: '24px 0' }}
    >
      {value === index && children}
    </div>
  );
}

export default DestinationDetail; 