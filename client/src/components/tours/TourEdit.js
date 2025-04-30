import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Button, 
  TextField, 
  Grid, 
  Alert, 
  InputAdornment, 
  Fade,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import Swal from 'sweetalert2';
import { updateTour, fetchGuides } from './tourapi';
import { fetchDestinations } from '../../redux/slices/destinationSlice';
import { fetchAccommodations } from '../../redux/slices/accSlice';

// Helper function to create a deep copy
const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

const TourEdit = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [guides, setGuides] = useState([]);
  const [guidesLoading, setGuidesLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // Get the tour data from localStorage
  const [tour, setTour] = useState(null);
  
  // Redux state
  const { destinations, loading: destinationsLoading } = useSelector(state => state.destinations);
  const { accommodations, loading: accommodationsLoading } = useSelector(state => state.accommodations);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 1,
    price: 0,
    maxParticipants: 1,
    difficulty: 'Moderate',
    mealOptions: 'Bed & Breakfast',
    tourGuideId: '',
    image: null,
    dailyItineraries: [
      {
        day: 1,
        destinations: [],
        accommodations: []
      }
    ]
  });

  // Load tour data and dependencies on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch destinations
        dispatch(fetchDestinations());
        
        // Fetch accommodations
        dispatch(fetchAccommodations());
        
        // Fetch guides
        setGuidesLoading(true);
        const guidesResponse = await fetchGuides();
        if (guidesResponse && guidesResponse.success) {
          setGuides(guidesResponse.data || []);
        } else {
          setError('Failed to load tour guides');
        }
        
        // Load tour data from localStorage
        const tourData = JSON.parse(localStorage.getItem("tour"));
        if (tourData) {
          setTour(tourData);
          
          // Initialize form data with tour values
          setFormData({
            name: tourData.name || '',
            description: tourData.description || '',
            duration: tourData.duration || 1,
            price: tourData.price || 0,
            maxParticipants: tourData.maxParticipants || 1,
            difficulty: tourData.difficulty || 'Moderate',
            mealOptions: tourData.mealOptions || 'Bed & Breakfast',
            tourGuideId: tourData.tourGuide?._id || tourData.tourGuide || '',
            image: null,
            dailyItineraries: Array.isArray(tourData.dailyItineraries) && tourData.dailyItineraries.length > 0 
              ? tourData.dailyItineraries.map(day => ({
                  day: day.day,
                  destinations: Array.isArray(day.destinations) 
                    ? day.destinations.map(dest => typeof dest === 'string' ? dest : dest._id)
                    : [],
                  accommodations: Array.isArray(day.accommodations) 
                    ? day.accommodations.map(acc => typeof acc === 'string' ? acc : acc._id)
                    : []
                }))
              : [{ day: 1, destinations: [], accommodations: [] }]
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'No tour data found to edit',
            icon: 'error',
            confirmButtonColor: '#4FD1C5'
          }).then(() => {
            navigate('/admin/tours');
          });
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load necessary data');
      } finally {
        setGuidesLoading(false);
        setIsPageLoaded(true);
      }
    };
    
    loadData();
  }, [dispatch, navigate]);

  // Input change handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
    setSuccess('');
  };

  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0]
    });
  };
  
  // Handle guide change
  const handleGuideChange = (guideId) => {
    setFormData(prev => ({
      ...prev,
      tourGuideId: guideId
    }));
  };
  
  // Itinerary handlers
  const handleAddDay = () => {
    setFormData(prev => {
      const updatedData = deepCopy(prev);
      const newDay = prev.dailyItineraries.length + 1;
      
      updatedData.dailyItineraries.push({
        day: newDay,
        destinations: [],
        accommodations: []
      });
      
      updatedData.duration = newDay;
      
      return updatedData;
    });
  };
  
  const handleRemoveDay = (dayIndex) => {
    if (formData.dailyItineraries.length <= 1) return;
    
    setFormData(prev => {
      const updatedData = deepCopy(prev);
      updatedData.dailyItineraries.splice(dayIndex, 1);
      
      // Renumber days
      updatedData.dailyItineraries = updatedData.dailyItineraries.map((day, idx) => ({
        ...day,
        day: idx + 1
      }));
      
      updatedData.duration = updatedData.dailyItineraries.length;
      
      return updatedData;
    });
  };
  
  const handleAddDestination = (dayIndex, destinationId) => {
    // Find the destination object
    const destination = destinations.find(d => d._id === destinationId);
    if (!destination) return;
    
    setFormData(prev => {
      const updatedData = deepCopy(prev);
      const dayItinerary = updatedData.dailyItineraries[dayIndex];
      
      // Check if destination already exists
      if (!dayItinerary.destinations.some(d => d === destinationId)) {
        dayItinerary.destinations.push(destinationId);
      }
      
      return updatedData;
    });
  };
  
  const handleRemoveDestination = (dayIndex, destinationId) => {
    setFormData(prev => {
      const updatedData = deepCopy(prev);
      const dayItinerary = updatedData.dailyItineraries[dayIndex];
      
      dayItinerary.destinations = dayItinerary.destinations.filter(d => d !== destinationId);
      
      return updatedData;
    });
  };
  
  const handleAddAccommodation = (dayIndex, accommodationId) => {
    // Find the accommodation object
    const accommodation = accommodations.find(a => a._id === accommodationId);
    if (!accommodation) return;
    
    setFormData(prev => {
      const updatedData = deepCopy(prev);
      const dayItinerary = updatedData.dailyItineraries[dayIndex];
      
      // Check if accommodation already exists and limit to 2 accommodations per day
      if (dayItinerary.accommodations.length < 2 && !dayItinerary.accommodations.includes(accommodationId)) {
        dayItinerary.accommodations.push(accommodationId);
      }
      
      return updatedData;
    });
  };
  
  const handleRemoveAccommodation = (dayIndex, accommodationId) => {
    setFormData(prev => {
      const updatedData = deepCopy(prev);
      const dayItinerary = updatedData.dailyItineraries[dayIndex];
      
      dayItinerary.accommodations = dayItinerary.accommodations.filter(a => a !== accommodationId);
      
      return updatedData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!tour?._id) {
        throw new Error('Tour ID is missing');
      }
      
      // Create a regular update data object instead of FormData
      const tourData = {
        name: formData.name,
        description: formData.description,
        duration: formData.duration,
        price: formData.price,
        maxParticipants: formData.maxParticipants,
        difficulty: formData.difficulty,
        mealOptions: formData.mealOptions,
        tourGuideId: formData.tourGuideId
      };
      
      // Add daily itineraries if valid
      if (formData.dailyItineraries && formData.dailyItineraries.length > 0) {
        // Filter out days with no destinations
        const validItineraries = formData.dailyItineraries.filter(day => 
          day.destinations && day.destinations.length > 0
        );
        
        if (validItineraries.length > 0) {
          tourData.dailyItineraries = validItineraries;
        }
      }
      
      // Update tour in the database
      const result = await updateTour(tour._id, tourData);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Tour updated successfully',
        confirmButtonColor: '#4FD1C5'
      });
      
      setSuccess('Tour updated successfully');
      setLoading(false);
      
      // Navigate back to tour management
      setTimeout(() => {
        navigate('/admin/tours');
      }, 1500);
      
    } catch (err) {
      console.error('Error updating tour:', err);
      setError(err.message || 'Failed to update tour');
      setLoading(false);
      
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.message || 'Failed to update tour',
        confirmButtonColor: '#f44336'
      });
    }
  };
  
  // Tour preview dialog
  const renderTourPreview = () => {
    // Find selected guide
    const selectedGuide = guides.find(g => g._id === formData.tourGuideId);
    
    return (
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5">
            {formData.name || 'Tour Package Preview'}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Description</Typography>
              <Typography variant="body1" paragraph>
                {formData.description}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1"><strong>Duration:</strong> {formData.duration} days</Typography>
              <Typography variant="subtitle1"><strong>Price:</strong> ${formData.price}</Typography>
              <Typography variant="subtitle1"><strong>Max Participants:</strong> {formData.maxParticipants}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1"><strong>Difficulty:</strong> {formData.difficulty}</Typography>
              <Typography variant="subtitle1"><strong>Meal Options:</strong> {formData.mealOptions}</Typography>
            </Grid>
            
            {selectedGuide && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Tour Guide</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle1">{selectedGuide.name}</Typography>
                </Box>
              </Grid>
            )}
            
            {formData.dailyItineraries && formData.dailyItineraries.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Daily Itinerary</Typography>
                {formData.dailyItineraries.map((day, index) => (
                  <Paper key={`preview-day-${index}`} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom><strong>Day {day.day}</strong></Typography>
                    
                    <Typography variant="body2" gutterBottom><strong>Destinations:</strong></Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {day.destinations.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">No destinations</Typography>
                      ) : (
                        day.destinations.map(destId => {
                          const dest = destinations.find(d => d._id === destId);
                          return (
                            <Chip 
                              key={destId} 
                              label={dest ? dest.name : `Unknown (${destId.slice(-5)})`} 
                              color="primary" 
                              variant="outlined"
                              size="small"
                            />
                          );
                        })
                      )}
                    </Box>
                    
                    <Typography variant="body2" gutterBottom><strong>Accommodations:</strong></Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {day.accommodations.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">No accommodations</Typography>
                      ) : (
                        day.accommodations.map(accId => {
                          const acc = accommodations.find(a => a._id === accId);
                          return (
                            <Chip 
                              key={accId} 
                              label={acc ? acc.accName : `Unknown (${accId.slice(-5)})`} 
                              color="secondary" 
                              variant="outlined"
                              size="small"
                            />
                          );
                        })
                      )}
                    </Box>
                  </Paper>
                ))}
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (!tour) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: 12,
        pb: 6,
        background: 'linear-gradient(135deg, #0E374E 0%, #4FD1C5 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite',
        '@keyframes gradient': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      }}
    >
      <Fade in={isPageLoaded} timeout={800}>
        <Container maxWidth="lg">
          <Paper
            elevation={3}
            sx={{ p: 4, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/admin/tours')}
                sx={{ mr: 2 }}
              >
                Back
              </Button>
              <Typography variant="h4" fontWeight="medium">Edit Tour Package</Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {error && <Fade in={true}><Alert severity="error" sx={{ mb: 2 }}>{error}</Alert></Fade>}
            {success && <Fade in={true}><Alert severity="success" sx={{ mb: 2 }}>{success}</Alert></Fade>}

            <Box component="form" onSubmit={handleSubmit}>
              {/* Basic Information */}
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Basic Information</Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tour Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Tour Guide</InputLabel>
                    <Select
                      name="tourGuideId"
                      value={formData.tourGuideId}
                      onChange={(e) => handleGuideChange(e.target.value)}
                      label="Tour Guide"
                    >
                      {guides.map((guide) => (
                        <MenuItem key={guide._id} value={guide._id}>
                          {guide.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Duration (days)"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleChange}
                    InputProps={{
                      inputProps: { min: 1 },
                      readOnly: true
                    }}
                    required
                    helperText="Duration is based on daily itineraries"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Price (LKR)"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    InputProps={{
                      inputProps: { min: 0 },
                      startAdornment: <InputAdornment position="start">₨</InputAdornment>
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Max Participants"
                    name="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                    InputProps={{
                      inputProps: { min: 1 }
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      label="Difficulty"
                    >
                      <MenuItem value="Easy">Easy</MenuItem>
                      <MenuItem value="Moderate">Moderate</MenuItem>
                      <MenuItem value="Challenging">Challenging</MenuItem>
                      <MenuItem value="Difficult">Difficult</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Meal Options</InputLabel>
                    <Select
                      name="mealOptions"
                      value={formData.mealOptions}
                      onChange={handleChange}
                      label="Meal Options"
                    >
                      <MenuItem value="Bed & Breakfast">Bed & Breakfast</MenuItem>
                      <MenuItem value="Half Board">Half Board</MenuItem>
                      <MenuItem value="Full Board">Full Board</MenuItem>
                      <MenuItem value="All Inclusive">All Inclusive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    component="label"
                    sx={{ mt: 1 }}
                  >
                    Update Tour Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                  {formData.image && (
                    <Typography variant="body2" sx={{ mt: 1, ml: 2 }}>
                      New image selected: {formData.image.name}
                    </Typography>
                  )}
                </Grid>
              </Grid>
              
              {/* Daily Itinerary */}
              <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
                Daily Itinerary
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />} 
                  onClick={handleAddDay}
                  sx={{ ml: 2 }}
                >
                  Add Day
                </Button>
              </Typography>
              
              {destinationsLoading || accommodationsLoading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {formData.dailyItineraries.map((day, dayIndex) => (
                    <Grid item xs={12} key={`day-${day.day}`}>
                      <Paper sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="h6">Day {day.day}</Typography>
                          {day.day > 1 && (
                            <IconButton onClick={() => handleRemoveDay(dayIndex)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                        
                        <Divider sx={{ mb: 2 }} />
                        
                        {/* Destinations */}
                        <Typography variant="subtitle1" gutterBottom>Destinations</Typography>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>Add Destination</InputLabel>
                          <Select
                            value=""
                            onChange={(e) => handleAddDestination(dayIndex, e.target.value)}
                            label="Add Destination"
                          >
                            {destinations.map(destination => (
                              <MenuItem key={destination._id} value={destination._id}>
                                {destination.name} ({destination.location?.district || 'Unknown location'})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                          {day.destinations.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              No destinations added yet
                            </Typography>
                          ) : (
                            day.destinations.map(destId => {
                              const destination = destinations.find(d => d._id === destId);
                              return (
                                <Chip
                                  key={destId}
                                  label={destination ? destination.name : `Unknown (${destId.slice(-5)})`}
                                  onDelete={() => handleRemoveDestination(dayIndex, destId)}
                                  color="primary"
                                  variant="outlined"
                                />
                              );
                            })
                          )}
                        </Box>
                        
                        {/* Accommodations */}
                        <Typography variant="subtitle1" gutterBottom>Accommodations</Typography>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>Add Accommodation</InputLabel>
                          <Select
                            value=""
                            onChange={(e) => handleAddAccommodation(dayIndex, e.target.value)}
                            label="Add Accommodation"
                            disabled={day.accommodations.length >= 2}
                          >
                            {accommodations.map(accommodation => (
                              <MenuItem key={accommodation._id} value={accommodation._id}>
                                {accommodation.accName} ({accommodation.location})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {day.accommodations.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              No accommodations added yet
                            </Typography>
                          ) : (
                            day.accommodations.map(accId => {
                              const accommodation = accommodations.find(a => a._id === accId);
                              return (
                                <Chip
                                  key={accId}
                                  label={accommodation ? accommodation.accName : `Unknown (${accId.slice(-5)})`}
                                  onDelete={() => handleRemoveAccommodation(dayIndex, accId)}
                                  color="secondary"
                                  variant="outlined"
                                />
                              );
                            })
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
              
              {/* Preview and Submit */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => setPreviewOpen(true)}
                  startIcon={<EditIcon />}
                >
                  Preview Tour Package
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                  sx={{ 
                    bgcolor: '#4FD1C5', 
                    color: 'white', 
                    px: 4, 
                    py: 1.5, 
                    '&:hover': { bgcolor: '#38A89D' } 
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Fade>
      
      {/* Tour Preview Dialog */}
      {renderTourPreview()}
    </Box>
  );
};

export default TourEdit; 