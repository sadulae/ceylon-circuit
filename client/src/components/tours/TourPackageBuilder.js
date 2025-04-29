import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  CardMedia,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, ArrowForward, ArrowBack } from '@mui/icons-material';
import { fetchDestinations } from '../../redux/slices/destinationSlice';
import { fetchAccommodations } from '../../redux/slices/accSlice';
import { createTour, getTours } from './tourapi';
import { fetchGuides } from './tourapi';
import Swal from 'sweetalert2';

// Sri Lanka districts
const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Mullaitivu', 'Vavuniya', 'Puttalam', 'Kurunegala', 'Anuradhapura',
  'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle', 'Trincomalee',
  'Batticaloa', 'Ampara'
];

const TourPackageBuilder = ({ onTourCreated }) => {
  const dispatch = useDispatch();
  
  // Redux state
  const { destinations, loading: destinationsLoading } = useSelector(state => state.destinations);
  const { accommodations, loading: accommodationsLoading } = useSelector(state => state.accommodations);
  
  // Component state
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guides, setGuides] = useState([]);
  const [guidesLoading, setGuidesLoading] = useState(false);
  const [tourPackage, setTourPackage] = useState({
    name: '',
    description: '',
    duration: 1,
    price: '',
    maxParticipants: '',
    difficulty: 'Moderate',
    mealOptions: 'Bed & Breakfast',
    tourGuideId: '',
    dailyItineraries: [
      {
        day: 1,
        destinations: [],
        accommodations: []
      }
    ]
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // Helper function to create a deep copy
  const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));
  
  // Form steps
  const steps = ['Basic Information', 'Tour Guide Selection', 'Itinerary Planning', 'Pricing & Review'];
  
  // Fetch dependencies on initial load
  useEffect(() => {
    const fetchData = async () => {
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
          setError('Failed to load guides');
        }
      } catch (error) {
        console.error('Error fetching tour package data:', error);
        setError('Failed to load necessary data. Please try again.');
      } finally {
        setGuidesLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch]);
  
  // Input change handlers
  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setTourPackage(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleGuideChange = (guideId) => {
    setTourPackage(prev => ({
      ...prev,
      tourGuideId: guideId
    }));
  };
  
  const handleAddDay = () => {
    setTourPackage(prev => {
      const updatedPackage = deepCopy(prev);
      const newDay = prev.dailyItineraries.length + 1;
      
      updatedPackage.dailyItineraries.push({
        day: newDay,
        destinations: [],
        accommodations: []
      });
      
      updatedPackage.duration = newDay;
      
      return updatedPackage;
    });
  };
  
  const handleRemoveDay = (dayIndex) => {
    if (tourPackage.dailyItineraries.length <= 1) return;
    
    setTourPackage(prev => {
      const updatedPackage = deepCopy(prev);
      updatedPackage.dailyItineraries.splice(dayIndex, 1);
      
      // Renumber days
      updatedPackage.dailyItineraries = updatedPackage.dailyItineraries.map((day, idx) => ({
        ...day,
        day: idx + 1
      }));
      
      updatedPackage.duration = updatedPackage.dailyItineraries.length;
      
      return updatedPackage;
    });
  };
  
  const handleAddDestination = (dayIndex, destinationId) => {
    // Find the destination object
    const destination = destinations.find(d => d._id === destinationId);
    if (!destination) return;
    
    setTourPackage(prev => {
      const updatedPackage = deepCopy(prev);
      const dayItinerary = updatedPackage.dailyItineraries[dayIndex];
      
      // Check if destination already exists
      if (!dayItinerary.destinations.some(d => d === destinationId)) {
        dayItinerary.destinations.push(destinationId);
      }
      
      return updatedPackage;
    });
  };
  
  const handleRemoveDestination = (dayIndex, destinationId) => {
    setTourPackage(prev => {
      const updatedPackage = deepCopy(prev);
      const dayItinerary = updatedPackage.dailyItineraries[dayIndex];
      
      dayItinerary.destinations = dayItinerary.destinations.filter(d => d !== destinationId);
      
      return updatedPackage;
    });
  };
  
  const handleAddAccommodation = (dayIndex, accommodationId) => {
    // Find the accommodation object
    const accommodation = accommodations.find(a => a._id === accommodationId);
    if (!accommodation) return;
    
    setTourPackage(prev => {
      const updatedPackage = deepCopy(prev);
      const dayItinerary = updatedPackage.dailyItineraries[dayIndex];
      
      // Check if accommodation already exists and limit to 2 accommodations per day
      if (dayItinerary.accommodations.length < 2 && !dayItinerary.accommodations.includes(accommodationId)) {
        dayItinerary.accommodations.push(accommodationId);
      }
      
      return updatedPackage;
    });
  };
  
  const handleRemoveAccommodation = (dayIndex, accommodationId) => {
    setTourPackage(prev => {
      const updatedPackage = deepCopy(prev);
      const dayItinerary = updatedPackage.dailyItineraries[dayIndex];
      
      dayItinerary.accommodations = dayItinerary.accommodations.filter(a => a !== accommodationId);
      
      return updatedPackage;
    });
  };
  
  // Navigation handlers
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(prevStep => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  // Validation
  const validateCurrentStep = () => {
    switch (activeStep) {
      case 0: // Basic Info
        return (
          tourPackage.name.trim() !== '' && 
          tourPackage.description.trim() !== '' && 
          tourPackage.difficulty !== '' && 
          tourPackage.mealOptions !== ''
        );
      
      case 1: // Tour Guide
        return tourPackage.tourGuideId !== '';
      
      case 2: // Itinerary
        return tourPackage.dailyItineraries.every(day => 
          day.destinations.length > 0 && day.accommodations.length > 0
        );
      
      case 3: // Pricing & Review
        return (
          tourPackage.price.toString().trim() !== '' && 
          parseFloat(tourPackage.price) > 0 &&
          tourPackage.maxParticipants.toString().trim() !== '' && 
          parseInt(tourPackage.maxParticipants) > 0
        );
      
      default:
        return true;
    }
  };
  
  // Form submission
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Format data for submission
      const formattedData = {
        ...tourPackage,
        price: parseFloat(tourPackage.price),
        maxParticipants: parseInt(tourPackage.maxParticipants),
        duration: parseInt(tourPackage.duration)
      };
      
      console.log('Submitting tour package:', formattedData);
      
      // Submit the tour package
      const response = await createTour(formattedData);
      
      setIsLoading(false);
      
      if (response && response.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Tour package created successfully',
          icon: 'success',
          confirmButtonColor: '#4FD1C5'
        });
        
        // Reset form
        setTourPackage({
          name: '',
          description: '',
          duration: 1,
          price: '',
          maxParticipants: '',
          difficulty: 'Moderate',
          mealOptions: 'Bed & Breakfast',
          tourGuideId: '',
          dailyItineraries: [
            {
              day: 1,
              destinations: [],
              accommodations: []
            }
          ]
        });
        
        setActiveStep(0);
        
        // Call callback if provided
        if (onTourCreated) {
          onTourCreated(response.data);
        }
      } else {
        setError(response?.message || 'Failed to create tour package');
      }
    } catch (error) {
      console.error('Error creating tour package:', error);
      setError(error.message || 'An unexpected error occurred');
      setIsLoading(false);
    }
  };
  
  // Render form steps
  const renderBasicInfoStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          label="Tour Package Name"
          name="name"
          value={tourPackage.name}
          onChange={handleBasicInfoChange}
          fullWidth
          required
          error={activeStep > 0 && tourPackage.name.trim() === ''}
          helperText={activeStep > 0 && tourPackage.name.trim() === '' ? 'Name is required' : ''}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Description"
          name="description"
          value={tourPackage.description}
          onChange={handleBasicInfoChange}
          fullWidth
          required
          multiline
          rows={4}
          error={activeStep > 0 && tourPackage.description.trim() === ''}
          helperText={activeStep > 0 && tourPackage.description.trim() === '' ? 'Description is required' : ''}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required error={activeStep > 0 && tourPackage.difficulty === ''}>
          <InputLabel>Difficulty</InputLabel>
          <Select
            name="difficulty"
            value={tourPackage.difficulty}
            onChange={handleBasicInfoChange}
            label="Difficulty"
          >
            <MenuItem value="Easy">Easy</MenuItem>
            <MenuItem value="Moderate">Moderate</MenuItem>
            <MenuItem value="Challenging">Challenging</MenuItem>
            <MenuItem value="Difficult">Difficult</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required error={activeStep > 0 && tourPackage.mealOptions === ''}>
          <InputLabel>Meal Options</InputLabel>
          <Select
            name="mealOptions"
            value={tourPackage.mealOptions}
            onChange={handleBasicInfoChange}
            label="Meal Options"
          >
            <MenuItem value="Full Board">Full Board</MenuItem>
            <MenuItem value="Half Board">Half Board</MenuItem>
            <MenuItem value="Bed & Breakfast">Bed & Breakfast</MenuItem>
            <MenuItem value="Room Only">Room Only</MenuItem>
            <MenuItem value="All Inclusive">All Inclusive</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
  
  const renderTourGuideStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Select Tour Guide
        </Typography>
      </Grid>
      
      {guidesLoading ? (
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Grid>
      ) : guides.length === 0 ? (
        <Grid item xs={12}>
          <Alert severity="warning">No tour guides available. Please add guides first.</Alert>
        </Grid>
      ) : (
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {guides.map(guide => (
              <Grid item xs={12} sm={6} md={4} key={guide._id}>
                <Card 
                  variant={tourPackage.tourGuideId === guide._id ? 'elevation' : 'outlined'}
                  elevation={tourPackage.tourGuideId === guide._id ? 6 : 1}
                  sx={{
                    cursor: 'pointer',
                    border: tourPackage.tourGuideId === guide._id ? '2px solid #4FD1C5' : '',
                    transition: 'all 0.2s ease-in-out',
                    ':hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 3
                    }
                  }}
                  onClick={() => handleGuideChange(guide._id)}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={guide.image || 'https://via.placeholder.com/300x200?text=Tour+Guide'}
                    alt={guide.name}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{guide.name}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {guide.phone}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Languages:</strong> {guide.languages?.join(', ')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Experience:</strong> {guide.experience} years
                    </Typography>
                    {guide.specializations?.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {guide.specializations.map(spec => (
                          <Chip 
                            key={spec} 
                            label={spec} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      )}
    </Grid>
  );
  
  const renderItineraryStep = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Daily Itinerary Planning</Typography>
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />} 
          onClick={handleAddDay}
        >
          Add Day
        </Button>
      </Box>
      
      {destinationsLoading || accommodationsLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {tourPackage.dailyItineraries.map((day, dayIndex) => (
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
    </Box>
  );
  
  const renderPricingStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          label="Price (USD)"
          name="price"
          type="number"
          value={tourPackage.price}
          onChange={handleBasicInfoChange}
          fullWidth
          required
          inputProps={{ min: 0 }}
          error={activeStep === 3 && (tourPackage.price === '' || parseFloat(tourPackage.price) <= 0)}
          helperText={activeStep === 3 && (tourPackage.price === '' || parseFloat(tourPackage.price) <= 0) ? 'Valid price is required' : ''}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label="Maximum Participants"
          name="maxParticipants"
          type="number"
          value={tourPackage.maxParticipants}
          onChange={handleBasicInfoChange}
          fullWidth
          required
          inputProps={{ min: 1 }}
          error={activeStep === 3 && (tourPackage.maxParticipants === '' || parseInt(tourPackage.maxParticipants) <= 0)}
          helperText={activeStep === 3 && (tourPackage.maxParticipants === '' || parseInt(tourPackage.maxParticipants) <= 0) ? 'Valid participant count is required' : ''}
        />
      </Grid>
      
      <Grid item xs={12}>
        <Box sx={{ mt: 2, mb: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => setPreviewOpen(true)}
            startIcon={<EditIcon />}
          >
            Preview Tour Package
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
  
  // Preview dialog
  const renderTourPackagePreview = () => {
    // Find selected guide
    const selectedGuide = guides.find(g => g._id === tourPackage.tourGuideId);
    
    return (
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5">
            {tourPackage.name || 'Tour Package Preview'}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Description</Typography>
              <Typography variant="body1" paragraph>
                {tourPackage.description}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1"><strong>Duration:</strong> {tourPackage.duration} days</Typography>
              <Typography variant="subtitle1"><strong>Price:</strong> ${tourPackage.price}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1"><strong>Difficulty:</strong> {tourPackage.difficulty}</Typography>
              <Typography variant="subtitle1"><strong>Meal Options:</strong> {tourPackage.mealOptions}</Typography>
              <Typography variant="subtitle1"><strong>Max Participants:</strong> {tourPackage.maxParticipants}</Typography>
            </Grid>
            
            {selectedGuide && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Tour Guide</Typography>
                <Box display="flex" alignItems="center">
                  <Box
                    component="img"
                    src={selectedGuide.image || 'https://via.placeholder.com/100?text=Guide'}
                    alt={selectedGuide.name}
                    sx={{ width: 80, height: 80, borderRadius: '50%', mr: 2 }}
                  />
                  <Box>
                    <Typography variant="subtitle1"><strong>{selectedGuide.name}</strong></Typography>
                    <Typography variant="body2">{selectedGuide.languages?.join(', ')}</Typography>
                    <Typography variant="body2">{selectedGuide.experience} years experience</Typography>
                  </Box>
                </Box>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Itinerary</Typography>
              {tourPackage.dailyItineraries.map((day, index) => {
                // Map destinations and accommodations to objects
                const dayDestinations = day.destinations.map(id => 
                  destinations.find(d => d._id === id) || { _id: id, name: `Unknown (${id.slice(-5)})` }
                );
                
                const dayAccommodations = day.accommodations.map(id => 
                  accommodations.find(a => a._id === id) || { _id: id, accName: `Unknown (${id.slice(-5)})` }
                );
                
                return (
                  <Paper key={`preview-day-${day.day}`} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6">Day {day.day}</Typography>
                    <Divider sx={{ my: 1 }} />
                    
                    <Typography variant="subtitle1" gutterBottom>Destinations:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {dayDestinations.map(dest => (
                        <Chip 
                          key={`preview-dest-${dest._id}`} 
                          label={dest.name} 
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    
                    <Typography variant="subtitle1" gutterBottom>Accommodations:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {dayAccommodations.map(acc => (
                        <Chip 
                          key={`preview-acc-${acc._id}`} 
                          label={acc.accName} 
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Paper>
                );
              })}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Render current step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderTourGuideStep();
      case 2:
        return renderItineraryStep();
      case 3:
        return renderPricingStep();
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Step content */}
      <Box sx={{ mt: 2, mb: 2 }}>
        {getStepContent(activeStep)}
      </Box>
      
      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<ArrowBack />}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          disabled={!validateCurrentStep() || isLoading}
          endIcon={activeStep === steps.length - 1 ? null : <ArrowForward />}
          startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : null}
        >
          {isLoading 
            ? 'Processing...' 
            : activeStep === steps.length - 1 
              ? 'Create Tour Package' 
              : 'Next'}
        </Button>
      </Box>
      
      {/* Tour preview dialog */}
      {renderTourPackagePreview()}
    </Box>
  );
};

export default TourPackageBuilder; 