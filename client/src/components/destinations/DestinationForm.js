import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  FormHelperText,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Stack,
  ListItem,
  List,
  ListItemText,
  Card,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import {
  PhotoCamera,
  Cancel,
  ArrowBack,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Image as ImageIcon,
  AccessTime as ClockIcon,
  Place as PlaceIcon
} from '@mui/icons-material';
import { 
  createDestination, 
  fetchDestination, 
  updateDestination,
  clearDestinationError,
  clearCurrentDestination,
  clearDestinationSuccess
} from '../../redux/slices/destinationSlice';
import Swal from 'sweetalert2';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';

// Categories and districts for the form
const categories = [
  'Beach', 'Cultural', 'Historical', 'Religious', 'Wildlife', 
  'Nature', 'Adventure', 'Heritage', 'City', 'Other'
];

const districts = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

const provinces = [
  'Central', 'Eastern', 'North Central', 'Northern', 
  'North Western', 'Sabaragamuwa', 'Southern', 
  'Uva', 'Western'
];

const features = [
  'Swimming', 'Hiking', 'Photography', 'Wildlife Viewing', 
  'Camping', 'Shopping', 'Local Cuisine', 'Historical Tours',
  'Water Sports', 'Cultural Experience', 'Pilgrimage', 
  'Bird Watching', 'Boat Rides', 'Fishing', 'Diving'
];

const seasons = ['Dry Season', 'Rainy Season', 'Year Round'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Add special holidays and Poya days
const specialHolidays = [
  'Poya Day', 
  'New Year\'s Day', 
  'Independence Day', 
  'Sinhala and Tamil New Year',
  'May Day',
  'Vesak Poya',
  'Poson Poya',
  'Christmas',
  'All Public Holidays'
];

const DestinationForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const { currentDestination, loading, error, success } = useSelector(state => state.destinations);
  
  // Error boundary state
  const [renderError, setRenderError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    summary: '',
    description: '',
    category: '',
    features: [],
    location: {
      address: '',
      district: '',
      province: '',
      mapLink: ''
    },
    mainImage: null,
    mainImagePreview: '',
    images: [],
    imagesPreviews: [],
    bestTimeToVisit: {
      season: 'Year Round',
      months: [],
      notes: ''
    },
    entryFee: {
      local: 0,
      foreign: 0,
      notes: ''
    },
    openingHours: {
      open: '',
      close: '',
      daysClosed: [],
      notes: ''
    },
    tips: ['']
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // Days of the week for closed days
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Load destination data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchDestination(id));
    }
    
    // Clear success flag when component mounts
    dispatch(clearDestinationSuccess());
    
    return () => {
      // Clean up
      dispatch(clearCurrentDestination());
      dispatch(clearDestinationSuccess());
    };
  }, [dispatch, id, isEditMode]);
  
  // Populate form with existing data if in edit mode
  useEffect(() => {
    if (isEditMode && currentDestination) {
      try {
        console.log("Loading destination data for edit:", currentDestination);
        
        // Create a safe structure with defaults for all nested properties
        const formattedData = {
          ...currentDestination,
          name: currentDestination.name || '',
          summary: currentDestination.summary || '',
          description: currentDestination.description || '',
          category: currentDestination.category || '',
          features: Array.isArray(currentDestination.features) ? currentDestination.features : [],
          mainImage: null, // We don't receive the actual file object from the server
          mainImagePreview: currentDestination.mainImage || '',
          images: [], // We don't receive the actual file objects from the server
          imagesPreviews: Array.isArray(currentDestination.images) ? currentDestination.images : [],
          
          // Make sure all required nested objects exist with all their properties
          location: {
            address: currentDestination.location?.address || '',
            district: currentDestination.location?.district || '',
            province: currentDestination.location?.province || '',
            mapLink: currentDestination.location?.mapLink || ''
          },
          
          bestTimeToVisit: {
            season: currentDestination.bestTimeToVisit?.season || 'Year Round',
            months: Array.isArray(currentDestination.bestTimeToVisit?.months) ? 
              currentDestination.bestTimeToVisit.months : [],
            notes: currentDestination.bestTimeToVisit?.notes || ''
          },
          
          entryFee: {
            local: currentDestination.entryFee?.local || 0,
            foreign: currentDestination.entryFee?.foreign || 0,
            notes: currentDestination.entryFee?.notes || ''
          },
          
          openingHours: {
            open: currentDestination.openingHours?.open || '',
            close: currentDestination.openingHours?.close || '',
            daysClosed: Array.isArray(currentDestination.openingHours?.daysClosed) ? 
              currentDestination.openingHours.daysClosed : [],
            notes: currentDestination.openingHours?.notes || ''
          },
          
          tips: Array.isArray(currentDestination.tips) && currentDestination.tips.length > 0 ? 
            currentDestination.tips : ['']
        };
        
        console.log("Formatted data for form:", formattedData);
        setFormData(formattedData);
      } catch (err) {
        console.error("Error formatting destination data:", err);
        setRenderError(err);
      }
    }
  }, [isEditMode, currentDestination]);
  
  // Add form reset function
  const resetForm = () => {
    // Reset form data to initial state
    setFormData({
      name: '',
      summary: '',
      description: '',
      category: '',
      features: [],
      location: {
        address: '',
        district: '',
        province: '',
        mapLink: ''
      },
      mainImage: null,
      mainImagePreview: '',
      images: [],
      imagesPreviews: [],
      bestTimeToVisit: {
        season: 'Year Round',
        months: [],
        notes: ''
      },
      entryFee: {
        local: 0,
        foreign: 0,
        notes: ''
      },
      openingHours: {
        open: '',
        close: '',
        daysClosed: [],
        notes: ''
      },
      tips: ['']
    });
    
    // Reset errors
    setErrors({});
    
    // Reset file input elements
    const mainImageInput = document.getElementById('main-image-input');
    const additionalImagesInput = document.getElementById('additional-images-input');
    
    if (mainImageInput) mainImageInput.value = '';
    if (additionalImagesInput) additionalImagesInput.value = '';
    
    console.log('Form has been reset');
  };
  
  // Handle success on create/update
  useEffect(() => {
    if (success) {
      Swal.fire({
        title: isEditMode ? 'Updated!' : 'Created!',
        text: isEditMode 
          ? 'Destination has been updated successfully' 
          : 'Destination has been created successfully',
        icon: 'success',
        timer: isEditMode ? undefined : 2000,
        showConfirmButton: isEditMode,
        confirmButtonText: isEditMode ? 'Return to List' : undefined,
      }).then((result) => {
        // In edit mode, only navigate if the user confirms
        if (isEditMode) {
          if (result.isConfirmed) {
            navigate('/admin/destinations');
          }
          // Otherwise stay on the edit page
        } else {
          // For new destinations, reset the form to allow adding another
          resetForm();
          // Show option to add another or return to list
          Swal.fire({
            title: 'What next?',
            text: 'Do you want to add another destination or go to the destinations list?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Add Another',
            cancelButtonText: 'Go to List'
          }).then((result) => {
            if (!result.isConfirmed) {
              navigate('/admin/destinations');
            }
            // If confirmed, stay on the page with reset form
          });
        }
      });
    }
  }, [success, navigate, isEditMode]);
  
  // Safety check to ensure form data has all required nested properties
  const ensureFormDataStructure = () => {
    try {
      // Create a safe copy with all required nested structures
      const safeCopy = {
        ...formData,
        name: formData.name || '',
        summary: formData.summary || '',
        description: formData.description || '',
        category: formData.category || '',
        features: formData.features || [],
        location: {
          ...(formData.location || {}),
          address: formData.location?.address || '',
          district: formData.location?.district || '',
          province: formData.location?.province || '',
          mapLink: formData.location?.mapLink || ''
        },
        mainImage: formData.mainImage || null,
        mainImagePreview: formData.mainImagePreview || '',
        images: formData.images || [],
        imagesPreviews: formData.imagesPreviews || [],
        bestTimeToVisit: {
          ...(formData.bestTimeToVisit || {}),
          season: formData.bestTimeToVisit?.season || 'Year Round',
          months: formData.bestTimeToVisit?.months || [],
          notes: formData.bestTimeToVisit?.notes || ''
        },
        entryFee: {
          ...(formData.entryFee || {}),
          local: formData.entryFee?.local || 0,
          foreign: formData.entryFee?.foreign || 0,
          notes: formData.entryFee?.notes || ''
        },
        openingHours: {
          ...(formData.openingHours || {}),
          open: formData.openingHours?.open || '',
          close: formData.openingHours?.close || '',
          daysClosed: formData.openingHours?.daysClosed || [],
          notes: formData.openingHours?.notes || ''
        },
        tips: formData.tips || ['']
      };
      
      // Update the form data if needed
      if (JSON.stringify(safeCopy) !== JSON.stringify(formData)) {
        setFormData(safeCopy);
      }
      
      return safeCopy;
    } catch (err) {
      console.error("Error in ensureFormDataStructure:", err);
      return formData;
    }
  };
  
  // Add this before the return statement to double-check before rendering
  useEffect(() => {
    ensureFormDataStructure();
  }, [formData]); // This will run whenever formData changes
  
  // Handler functions
  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Starting form validation...');
    
    // Validate form - more comprehensive validation
    const validationErrors = {};
    
    // Basic required fields
    if (!formData.name) validationErrors.name = 'Name is required';
    if (!formData.description) validationErrors.description = 'Description is required';
    if (!formData.category) validationErrors.category = 'Category is required';
    
    // Location validation
    if (!formData.location.address) validationErrors['location.address'] = 'Address is required';
    if (!formData.location.district) validationErrors['location.district'] = 'District is required';
    if (!formData.location.province) validationErrors['location.province'] = 'Province is required';
    
    // Google Maps link validation
    if (!formData.location.mapLink) {
      validationErrors['location.mapLink'] = 'Google Maps link is required';
    } else if (!validateGoogleMapsLink(formData.location.mapLink)) {
      // Add helpful error message explaining accepted formats
      validationErrors['location.mapLink'] = 'Please provide a valid Google Maps link (e.g., https://maps.app.goo.gl/... or https://goo.gl/maps/...)';
    }
    
    // Features validation
    if (!formData.features || formData.features.length === 0) {
      validationErrors.features = 'At least one feature is required';
    }
    
    // Main image validation
    if (!formData.mainImage && !formData.mainImagePreview) {
      validationErrors.mainImage = 'Main image is required';
    }
    
    // Opening/closing time validation
    if (formData.openingHours.open && formData.openingHours.close) {
      // Convert times to comparable format
      const openTime = new Date(`2000-01-01T${formData.openingHours.open}`);
      const closeTime = new Date(`2000-01-01T${formData.openingHours.close}`);
      if (closeTime <= openTime) {
        validationErrors['openingHours.close'] = 'Closing time must be after opening time';
      }
    }
    
    if (Object.keys(validationErrors).length > 0) {
      console.log('Validation errors found:', validationErrors);
      setErrors(validationErrors);
      
      // Show error toast
      Swal.fire({
        title: 'Validation Error',
        text: 'Please check the form for errors',
        icon: 'error',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }
    
    // Clear validation errors
    setErrors({});
    console.log('Form validation successful, preparing to submit...');
    
    // Prepare form data for API
    const destinationData = new FormData();
    
    // Add basic fields
    destinationData.append('name', formData.name);
    destinationData.append('summary', formData.summary || '');
    destinationData.append('description', formData.description);
    destinationData.append('category', formData.category);
    
    // Add features as JSON string
    if (formData.features && formData.features.length) {
      destinationData.append('features', JSON.stringify(formData.features));
    }
    
    // Add location as JSON string - now with mapLink instead of coordinates
    const locationData = {
      address: formData.location.address,
      district: formData.location.district,
      province: formData.location.province,
      mapLink: formData.location.mapLink || ''
    };
    destinationData.append('location', JSON.stringify(locationData));
    
    // Add best time to visit as JSON string
    destinationData.append('bestTimeToVisit', JSON.stringify(formData.bestTimeToVisit));
    
    // Add entry fee as JSON string
    const entryFeeData = {
      ...formData.entryFee,
      local: parseFloat(formData.entryFee.local) || 0,
      foreign: parseFloat(formData.entryFee.foreign) || 0
    };
    destinationData.append('entryFee', JSON.stringify(entryFeeData));
    
    // Add opening hours as JSON string
    destinationData.append('openingHours', JSON.stringify(formData.openingHours));
    
    // Add tips as JSON string if not empty
    if (formData.tips && formData.tips.length && formData.tips[0] !== '') {
      // Filter out empty tips
      const nonEmptyTips = formData.tips.filter(tip => tip.trim() !== '');
      if (nonEmptyTips.length > 0) {
        destinationData.append('tips', JSON.stringify(nonEmptyTips));
      }
    }
    
    // Add main image if new one is selected
    if (formData.mainImage) {
      destinationData.append('mainImage', formData.mainImage);
    } else if (formData.mainImagePreview && !isEditMode) {
      // In case there's a validation error for mainImage
      setErrors({ mainImage: 'Main image is required' });
      return;
    }
    
    // Add additional images if any are selected
    if (formData.images && formData.images.length) {
      for (let i = 0; i < formData.images.length; i++) {
        destinationData.append('images', formData.images[i]);
      }
    }
    
    console.log('Form data prepared, submitting to API...');
    
    // Show loading toast
    Swal.fire({
      title: isEditMode ? 'Updating...' : 'Creating...',
      text: 'Please wait while we process your request',
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // Submit form
    if (isEditMode) {
      dispatch(updateDestination({ id, destinationData }))
        .unwrap()
        .then(() => {
          Swal.close();
          
          // Show success message
          Swal.fire({
            title: 'Success!',
            text: 'Destination has been updated successfully',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => {
            // Redirect to destinations list page
            navigate('/admin/destinations');
          });
        })
        .catch(error => {
          console.error('Error updating destination:', error);
          Swal.fire({
            title: 'Error',
            text: error || 'Failed to update destination',
            icon: 'error'
          });
        });
    } else {
      dispatch(createDestination(destinationData))
        .unwrap()
        .then(() => {
          Swal.close();
        })
        .catch(error => {
          console.error('Error creating destination:', error);
          Swal.fire({
            title: 'Error',
            text: error || 'Failed to create destination',
            icon: 'error'
          });
        });
    }
  };
  
  // Handle general input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      // Handle regular properties
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle features multi-select
  const handleFeaturesChange = (e) => {
    setFormData(prev => ({
      ...prev,
      features: e.target.value
    }));
  };
  
  // Handle main image upload with validation
  const handleMainImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!acceptedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          mainImage: 'Please upload a valid image file (JPEG, PNG, or WebP)'
        }));
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          mainImage: 'Image file is too large. Maximum size is 5MB'
        }));
        return;
      }
      
      // Create a preview URL
      const preview = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        mainImage: file,
        mainImagePreview: preview
      }));
      
      // Clear main image error if it exists
      if (errors.mainImage) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.mainImage;
          return newErrors;
        });
      }
      
      console.log('Main image selected:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
    }
  };
  
  // Handle additional images upload with validation
  const handleImagesChange = (e) => {
    if (e.target.files && e.target.files.length) {
      const files = Array.from(e.target.files);
      const acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      // Filter out invalid files
      const validFiles = [];
      const invalidFiles = [];
      
      files.forEach(file => {
        if (!acceptedTypes.includes(file.type)) {
          invalidFiles.push({ name: file.name, reason: 'Invalid file type' });
        } else if (file.size > maxSize) {
          invalidFiles.push({ name: file.name, reason: 'File too large (max 5MB)' });
        } else {
          validFiles.push(file);
        }
      });
      
      // Show warning for invalid files
      if (invalidFiles.length > 0) {
        const invalidFileNames = invalidFiles.map(f => `${f.name} (${f.reason})`).join(', ');
        Swal.fire({
          title: 'Some files were not added',
          text: `The following files couldn't be added: ${invalidFileNames}`,
          icon: 'warning',
          confirmButtonText: 'OK'
        });
      }
      
      if (validFiles.length > 0) {
        const previews = validFiles.map(file => URL.createObjectURL(file));
        
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), ...validFiles],
          imagesPreviews: [...(prev.imagesPreviews || []), ...previews]
        }));
        
        console.log('Added', validFiles.length, 'additional images');
      }
    }
  };
  
  // Remove additional image
  const removeImage = (index) => {
    setFormData(prev => {
      const prevImages = prev.images || [];
      const newImages = [...prevImages];
      const newPreviews = [...(prev.imagesPreviews || [])];
      
      // If the image was already saved (no file object in images array)
      if (prevImages.length <= index) {
        newPreviews.splice(index, 1);
      } else {
        newImages.splice(index, 1);
        newPreviews.splice(index, 1);
      }
      
      return {
        ...prev,
        images: newImages,
        imagesPreviews: newPreviews
      };
    });
  };
  
  // Handle months multi-select
  const handleMonthsChange = (e) => {
    setFormData(prev => ({
      ...prev,
      bestTimeToVisit: {
        ...prev.bestTimeToVisit,
        months: e.target.value
      }
    }));
  };
  
  // Handle entry fee changes
  const handleEntryFeeChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      entryFee: {
        ...prev.entryFee,
        [field]: field === 'notes' ? value : parseFloat(value) || 0
      }
    }));
  };
  
  // Handle days closed checkbox
  const handleDaysClosedChange = (day) => {
    setFormData(prev => {
      const currentDays = prev.openingHours?.daysClosed || [];
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];
      
      return {
        ...prev,
        openingHours: {
          ...prev.openingHours,
          daysClosed: newDays
        }
      };
    });
  };
  
  // Handle tip field changes
  const handleTipChange = (index, value) => {
    setFormData(prev => {
      const newTips = [...prev.tips];
      newTips[index] = value;
      return {
        ...prev,
        tips: newTips
      };
    });
  };
  
  // Add new tip field
  const addTipField = () => {
    setFormData(prev => ({
      ...prev,
      tips: [...prev.tips, '']
    }));
  };
  
  // Remove tip field
  const removeTipField = (index) => {
    setFormData(prev => {
      const newTips = [...prev.tips];
      newTips.splice(index, 1);
      return {
        ...prev,
        tips: newTips.length ? newTips : ['']
      };
    });
  };
  
  // Handle time picker dialogs
  const [openTimePicker, setOpenTimePicker] = useState(false);
  const [closeTimePicker, setCloseTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [timeType, setTimeType] = useState('');
  
  const handleTimePickerOpen = (type) => {
    setTimeType(type);
    // Parse the time string to Date object if it exists
    if (formData.openingHours[type]) {
      try {
        setSelectedTime(new Date(`2000-01-01T${formData.openingHours[type]}`));
      } catch (err) {
        console.error(`Error parsing ${type} time:`, err);
        setSelectedTime(null);
      }
    } else {
      setSelectedTime(null);
    }
    if (type === 'open') {
      setOpenTimePicker(true);
    } else {
      setCloseTimePicker(true);
    }
  };

  const handleTimePickerClose = () => {
    setOpenTimePicker(false);
    setCloseTimePicker(false);
    setSelectedTime(null);
  };

  const handleTimeChange = (newTime) => {
    if (newTime && !isNaN(newTime.getTime())) {
      setSelectedTime(newTime);
    } else {
      console.error('Invalid time selected:', newTime);
    }
  };

  const handleTimeConfirm = () => {
    if (selectedTime && !isNaN(selectedTime.getTime())) {
      // Format time as HH:MM using 24-hour format
      const formattedTime = selectedTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      setFormData(prev => ({
        ...prev,
        openingHours: {
          ...prev.openingHours,
          [timeType]: formattedTime
        }
      }));
      
      // If this is the open time, check if close time is valid
      if (timeType === 'open' && formData.openingHours.close) {
        try {
          const openTime = new Date(`2000-01-01T${formattedTime}`);
          const closeTime = new Date(`2000-01-01T${formData.openingHours.close}`);
          
          if (closeTime <= openTime) {
            // Set error for close time
            setErrors(prev => ({
              ...prev,
              'openingHours.close': 'Closing time must be after opening time'
            }));
          } else {
            // Clear error if exists
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors['openingHours.close'];
              return newErrors;
            });
          }
        } catch (err) {
          console.error('Error comparing times:', err);
        }
      }
      
      // Clear any time error
      if (errors[`openingHours.${timeType}`]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`openingHours.${timeType}`];
          return newErrors;
        });
      }
    }
    
    handleTimePickerClose();
  };

  // Google Maps link validator
  const validateGoogleMapsLink = (link) => {
    if (!link) return false;
    
    try {
      // Convert to URL object to normalize the link
      const url = new URL(link);
      
      // Check for common Google Maps URL patterns
      const validHostPatterns = [
        'google.com',
        'maps.google.com',
        'goo.gl',
        'maps.app.goo.gl'
      ];
      
      // Check if any of the valid host patterns are in the URL
      return validHostPatterns.some(pattern => 
        url.hostname === pattern || url.hostname.endsWith('.' + pattern)
      );
    } catch (error) {
      // If URL parsing fails, try simple string matching
      console.log('URL parsing failed, using string matching for:', link);
      
      const stringPatterns = [
        'google.com/maps',
        'maps.google.com',
        'goo.gl/maps',
        'maps.app.goo.gl'
      ];
      
      return stringPatterns.some(pattern => link.includes(pattern));
    }
  };

  // Handle Google Maps link change with validation
  const handleMapLinkChange = (e) => {
    const { value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        mapLink: value
      }
    }));
    
    // Validate and set/clear error
    if (value && !validateGoogleMapsLink(value)) {
      setErrors(prev => ({
        ...prev,
        'location.mapLink': 'Please provide a valid Google Maps link'
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors['location.mapLink'];
        return newErrors;
      });
    }
  };

  // Section rendering functions
  const renderBasicInfoSection = () => (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <Typography variant="h6" gutterBottom color="primary" fontWeight="500" sx={{ pb: 1, borderBottom: '1px solid #f0f0f0' }}>
        Basic Information
      </Typography>
      
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Destination Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name || ''}
            required
            variant="outlined"
            InputProps={{ sx: { borderRadius: 1.5 } }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Summary"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            placeholder="Brief summary of the destination (max 200 characters)"
            inputProps={{ maxLength: 200 }}
            multiline
            rows={2}
            variant="outlined"
            InputProps={{ sx: { borderRadius: 1.5 } }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description || ''}
            multiline
            rows={3}
            required
            variant="outlined"
            InputProps={{ sx: { borderRadius: 1.5 } }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.category} variant="outlined">
            <InputLabel id="category-label" required>Category</InputLabel>
            <Select
              labelId="category-label"
              name="category"
              value={formData.category}
              onChange={handleChange}
              label="Category"
              sx={{ borderRadius: 1.5 }}
            >
              {categories.map(category => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
            {errors.category && (
              <FormHelperText>{errors.category}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderLocationSection = () => (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <Typography variant="h6" gutterBottom color="primary" fontWeight="500" sx={{ pb: 1, borderBottom: '1px solid #f0f0f0' }}>
        Location Details
      </Typography>
      
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            name="location.address"
            value={formData.location.address}
            onChange={handleChange}
            error={!!errors['location.address']}
            helperText={errors['location.address'] || ''}
            required
            variant="outlined"
            InputProps={{ sx: { borderRadius: 1.5 } }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors['location.district']} variant="outlined">
            <InputLabel id="district-label" required>District</InputLabel>
            <Select
              labelId="district-label"
              name="location.district"
              value={formData.location.district}
              onChange={handleChange}
              label="District"
              sx={{ borderRadius: 1.5 }}
            >
              {districts.map(district => (
                <MenuItem key={district} value={district}>
                  {district}
                </MenuItem>
              ))}
            </Select>
            {errors['location.district'] && (
              <FormHelperText>{errors['location.district']}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="province-label">Province</InputLabel>
            <Select
              labelId="province-label"
              name="location.province"
              value={formData.location.province}
              onChange={handleChange}
              label="Province"
              sx={{ borderRadius: 1.5 }}
            >
              {provinces.map(province => (
                <MenuItem key={province} value={province}>
                  {province}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Google Maps Link"
            name="location.mapLink"
            value={formData.location.mapLink || ''}
            onChange={handleMapLinkChange}
            error={!!errors['location.mapLink']}
            helperText={errors['location.mapLink'] || 'Add a Google Maps link (maps.google.com, maps.app.goo.gl, etc.)'}
            required
            variant="outlined"
            InputProps={{
              sx: { borderRadius: 1.5 },
              startAdornment: (
                <InputAdornment position="start">
                  <PlaceIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );

  const renderImagesSection = () => (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <Typography variant="h6" gutterBottom color="primary" fontWeight="500" sx={{ pb: 1, borderBottom: '1px solid #f0f0f0' }}>
        Images
      </Typography>
      
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Main Image (Required)
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
              sx={{ mr: 2, borderRadius: 1.5 }}
            >
              Upload Main Image
              <input
                accept="image/*"
                id="main-image-input"
                type="file"
                onChange={handleMainImageChange}
                style={{ display: 'none' }}
              />
            </Button>
            
            {errors.mainImage && (
              <Typography color="error" variant="caption">
                {errors.mainImage}
              </Typography>
            )}
          </Box>
          
          {formData.mainImagePreview && (
            <Box sx={{ position: 'relative', width: 150, height: 120, mb: 2 }}>
              <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  height="120"
                  image={formData.mainImagePreview}
                  alt="Main destination image"
                />
              </Card>
            </Box>
          )}
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">
              Additional Images (Optional)
            </Typography>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
              size="small"
              sx={{ borderRadius: 1.5 }}
            >
              Add Images
              <input
                accept="image/*"
                id="additional-images-input"
                type="file"
                multiple
                onChange={handleImagesChange}
                style={{ display: 'none' }}
              />
            </Button>
          </Box>
          
          <Grid container spacing={1}>
            {formData.imagesPreviews.map((preview, index) => (
              <Grid item key={index} xs={4} sm={4}>
                <Box sx={{ position: 'relative' }}>
                  <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      height="80"
                      image={preview}
                      alt={`Additional image ${index + 1}`}
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeImage(index)}
                      sx={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        bgcolor: 'rgba(255,255,255,0.7)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                        width: 20,
                        height: 20
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Card>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderFeaturesSection = () => (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Features
      </Typography>
      
      <FormControl fullWidth error={!!errors.features}>
        <InputLabel id="features-label" required>Features</InputLabel>
        <Select
          labelId="features-label"
          multiple
          value={formData.features}
          onChange={handleFeaturesChange}
          input={<OutlinedInput label="Features" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {features.map((feature) => (
            <MenuItem key={feature} value={feature}>
              {feature}
            </MenuItem>
          ))}
        </Select>
        {errors.features && (
          <FormHelperText>{errors.features}</FormHelperText>
        )}
      </FormControl>
    </Paper>
  );

  const renderBestTimeSection = () => (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Best Time to Visit
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="season-label">Season</InputLabel>
            <Select
              labelId="season-label"
              name="bestTimeToVisit.season"
              value={formData.bestTimeToVisit.season}
              onChange={handleChange}
              label="Season"
            >
              {seasons.map(season => (
                <MenuItem key={season} value={season}>
                  {season}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="months-label">Months</InputLabel>
            <Select
              labelId="months-label"
              multiple
              value={formData.bestTimeToVisit.months}
              onChange={handleMonthsChange}
              input={<OutlinedInput label="Months" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {months.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Additional Notes"
            name="bestTimeToVisit.notes"
            value={formData.bestTimeToVisit.notes}
            onChange={handleChange}
            multiline
            rows={2}
            placeholder="Additional information about visiting seasons, weather, etc."
          />
        </Grid>
      </Grid>
    </Paper>
  );

  const renderEntryFeeSection = () => (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Entry Fee
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Local Fee (LKR)"
            type="number"
            value={formData.entryFee.local}
            onChange={(e) => handleEntryFeeChange('local', e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Foreign Fee (LKR)"
            type="number"
            value={formData.entryFee.foreign}
            onChange={(e) => handleEntryFeeChange('foreign', e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Fee Notes"
            value={formData.entryFee.notes}
            onChange={(e) => handleEntryFeeChange('notes', e.target.value)}
            multiline
            rows={2}
            placeholder="Additional information about fees, discounts, etc."
          />
        </Grid>
      </Grid>
    </Paper>
  );

  const renderOpeningHoursSection = () => (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Opening Hours
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Opening Time"
            value={formData.openingHours.open || ''}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <ClockIcon />
                </InputAdornment>
              ),
            }}
            onClick={() => handleTimePickerOpen('open')}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Closing Time"
            value={formData.openingHours.close || ''}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <ClockIcon />
                </InputAdornment>
              ),
            }}
            onClick={() => handleTimePickerOpen('close')}
            sx={{ cursor: 'pointer' }}
            error={!!errors['openingHours.close']}
            helperText={errors['openingHours.close'] || ''}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Days Closed
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {daysOfWeek.map(day => (
              <Chip
                key={day}
                label={day}
                onClick={() => handleDaysClosedChange(day)}
                color={formData.openingHours.daysClosed.includes(day) ? 'primary' : 'default'}
                variant={formData.openingHours.daysClosed.includes(day) ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
          
          <Typography variant="subtitle2" gutterBottom>
            Special Holidays (Closed)
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {specialHolidays.map(holiday => (
              <Chip
                key={holiday}
                label={holiday}
                onClick={() => handleDaysClosedChange(holiday)}
                color={formData.openingHours.daysClosed.includes(holiday) ? 'secondary' : 'default'}
                variant={formData.openingHours.daysClosed.includes(holiday) ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Additional Notes"
            name="openingHours.notes"
            value={formData.openingHours.notes}
            onChange={handleChange}
            multiline
            rows={2}
            placeholder="E.g., Seasonal hours, special arrangements, etc."
          />
        </Grid>
      </Grid>
    </Paper>
  );

  const renderTipsSection = () => (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Travel Tips
      </Typography>
      
      {formData.tips.map((tip, index) => (
        <Box key={index} sx={{ display: 'flex', mb: 2 }}>
          <TextField
            fullWidth
            label={`Tip ${index + 1}`}
            value={tip}
            onChange={(e) => handleTipChange(index, e.target.value)}
            multiline
            rows={2}
          />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
            {formData.tips.length > 1 && (
              <IconButton 
                color="error" 
                onClick={() => removeTipField(index)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            )}
            
            {index === formData.tips.length - 1 && (
              <IconButton 
                color="primary" 
                onClick={addTipField}
                size="small"
              >
                <AddIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      ))}
    </Paper>
  );

  const renderFormActions = () => (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
      <Button
        variant="outlined"
        onClick={() => navigate('/admin/destinations')}
        size="large"
        sx={{ borderRadius: 2 }}
      >
        Cancel
      </Button>
      
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : isEditMode ? <SaveIcon /> : <AddIcon />}
        size="large"
        sx={{ borderRadius: 2, px: 4, py: 1.2, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
      >
        {loading ? 'Saving...' : isEditMode ? 'Update Destination' : 'Add Destination'}
      </Button>
    </Box>
  );

  const renderTimePickerDialogs = () => (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={openTimePicker || closeTimePicker} onClose={handleTimePickerClose}>
        <DialogTitle>
          {timeType === 'open' ? 'Select Opening Time' : 'Select Closing Time'}
        </DialogTitle>
        <DialogContent>
          <TimePicker
            value={selectedTime}
            onChange={handleTimeChange}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTimePickerClose}>Cancel</Button>
          <Button onClick={handleTimeConfirm} color="primary">Confirm</Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );

  // Create a render function to handle potential errors
  const renderForm = () => {
    try {
      console.log("Rendering form with safe data:", formData);
      
      return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ 
            p: { xs: 3, md: 4 }, 
            borderRadius: 3, 
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              mb: 4, 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
              pb: 2,
              borderBottom: '1px solid #eaeaea'
            }}>
              <Typography variant="h4" component="h1" fontWeight="500" color="primary">
                {isEditMode ? 'Update Destination' : 'New Destination'}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/admin/destinations')}
                sx={{ borderRadius: 2 }}
              >
                Back to Destinations
              </Button>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Left Column */}
                <Grid item xs={12} md={6}>
                  {/* Basic Info Section */}
                  {renderBasicInfoSection()}
                  
                  {/* Location Section */}
                  {renderLocationSection()}
                  
                  {/* Images Section */}
                  {renderImagesSection()}
                  
                  {/* Features Section */}
                  {renderFeaturesSection()}
                </Grid>
                
                {/* Right Column */}
                <Grid item xs={12} md={6}>
                  {/* Best Time to Visit Section */}
                  {renderBestTimeSection()}
                  
                  {/* Entry Fee Section */}
                  {renderEntryFeeSection()}
                  
                  {/* Opening Hours Section */}
                  {renderOpeningHoursSection()}
                  
                  {/* Tips Section */}
                  {renderTipsSection()}
                </Grid>
              </Grid>
              
              {/* Form Actions - Full Width */}
              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #eaeaea' }}>
                {renderFormActions()}
              </Box>
              
              {/* Time Picker Dialogs */}
              {renderTimePickerDialogs()}
            </form>
          </Paper>
        </Container>
      );
    } catch (err) {
      console.error("Error rendering form:", err);
      setRenderError(err);
      return <Typography color="error">Error rendering form. Please try again later.</Typography>;
    }
  };
  
  if (renderError) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          An error occurred while rendering the form: {renderError.message}
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => {
            setRenderError(null);
            navigate('/admin/destinations');
          }}
        >
          Return to Destination List
        </Button>
      </Box>
    );
  }
  
  return renderForm();
};

export default DestinationForm; 