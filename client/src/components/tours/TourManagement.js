import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  InputAdornment,
  Divider,
  Card,
  CardContent,
  Menu,
  Tooltip
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  Visibility as ViewIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';
import { selectIsAuthenticated, selectUser } from '../../redux/slices/authSlice';
import { getTours, deleteTour, fetchGuides, deleteGuide, updateGuide } from './tourapi';
import TourPackageBuilder from './TourPackageBuilder';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';  // Import jsPDF for PDF generation

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tour-tabpanel-${index}`}
      aria-labelledby={`tour-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TourManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  
  // Component state
  const [tabValue, setTabValue] = useState(0);
  const [tours, setTours] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewTourOpen, setViewTourOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [createPackageOpen, setCreatePackageOpen] = useState(false);
  
  // Search and filter state
  const [tourSearchQuery, setTourSearchQuery] = useState('');
  const [guideSearchQuery, setGuideSearchQuery] = useState('');
  const [tourFilterAnchorEl, setTourFilterAnchorEl] = useState(null);
  const [guideFilterAnchorEl, setGuideFilterAnchorEl] = useState(null);
  const [tourFilters, setTourFilters] = useState({
    difficulty: '',
    mealOptions: '',
    priceMin: '',
    priceMax: '',
    durationMin: '',
    durationMax: ''
  });
  const [guideFilters, setGuideFilters] = useState({
    district: '',
    language: '',
    experienceMin: ''
  });
  
  // Guide update state
  const [updateGuideOpen, setUpdateGuideOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [updatedGuide, setUpdatedGuide] = useState({
    name: '',
    email: '',
    phone: '',
    languages: '',
    experience: '',
    description: '',
    image: null
  });
  
  // Report dialogs
  const [tourReportOpen, setTourReportOpen] = useState(false);
  const [guideReportOpen, setGuideReportOpen] = useState(false);
  
  // Handle back navigation to admin dashboard
  const handleBackToAdmin = () => {
    navigate('/admin');
  };
  
    // Fetch tours and guides data
    const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch tours
      const toursResponse = await getTours();
      if (toursResponse && toursResponse.data) {
        setTours(toursResponse.data);
      } else if (Array.isArray(toursResponse)) {
        setTours(toursResponse);
      } else {
      setTours([]);
      }
      
      // Fetch guides if viewing guides tab
      if (tabValue === 1) {
        const guidesResponse = await fetchGuides();
        if (guidesResponse && guidesResponse.success) {
          setGuides(guidesResponse.data || []);
      } else {
        setGuides([]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch tours and guides on initial load
  useEffect(() => {
    fetchData();
  }, [tabValue]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle tour creation success
  const handleTourCreated = () => {
    setCreatePackageOpen(false);
    fetchData();
  };
  
  // Handle tour deletion
  const handleDeleteTour = async (tourId) => {
        Swal.fire({
      title: 'Delete Tour Package',
      text: 'Are you sure you want to delete this tour package? This action cannot be undone.',
          icon: 'warning',
          showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
          if (result.isConfirmed) {
        try {
          await deleteTour(tourId);
          
          // Refresh tours list
          fetchData();
          
          Swal.fire(
            'Deleted!',
            'The tour package has been deleted.',
            'success'
          );
    } catch (error) {
          console.error('Error deleting tour:', error);
          Swal.fire(
            'Error',
            'Failed to delete the tour package.',
            'error'
          );
        }
      }
    });
  };

  // Handle guide deletion
  const handleDeleteGuide = async (guideId) => {
    Swal.fire({
      title: 'Delete Tour Guide',
      text: 'Are you sure you want to delete this tour guide?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteGuide(guideId);
          
          // Refresh guides list
          const response = await fetchGuides();
          if (response && response.success) {
            setGuides(response.data || []);
          }
          
          Swal.fire(
            'Deleted!',
            'The tour guide has been deleted.',
            'success'
          );
        } catch (error) {
          console.error('Error deleting guide:', error);
          Swal.fire(
            'Error',
            'Failed to delete the tour guide.',
            'error'
          );
        }
      }
    });
  };

  // Handle view tour details
  const handleViewTour = (tour) => {
    setSelectedTour(tour);
    setViewTourOpen(true);
  };
  
  // Handle tour editing
  const handleEditTour = (tour) => {
    // Store tour data in localStorage and navigate to edit page
    localStorage.setItem('tour', JSON.stringify(tour));
    navigate('/tour-edit');
  };

  // Handle guide editing
  const handleEditGuide = (guide) => {
    // Open update dialog with current guide data
    setSelectedGuide(guide);
    setUpdatedGuide({
      name: guide.name,
      email: guide.email,
      phone: guide.phone,
      languages: guide.languages ? guide.languages.join(', ') : '',
      experience: guide.experience,
      description: guide.bio || '',
      image: null
    });
    setUpdateGuideOpen(true);
  };
  
  // Handle guide update dialog close
  const handleUpdateGuideClose = () => {
    setUpdateGuideOpen(false);
    setSelectedGuide(null);
  };
  
  // Handle guide update submission
  const handleUpdateGuide = async () => {
    if (!selectedGuide) return;
    
    try {
      const formData = new FormData();
      formData.append('name', updatedGuide.name);
      formData.append('email', updatedGuide.email);
      formData.append('phone', updatedGuide.phone);
      formData.append('languages', updatedGuide.languages);
      formData.append('experience', updatedGuide.experience);
      formData.append('bio', updatedGuide.description);
      if (updatedGuide.image) formData.append('image', updatedGuide.image);
      
      await updateGuide(selectedGuide._id, formData);
      
      Swal.fire({
        title: 'Success!',
        text: 'Tour guide updated successfully',
        icon: 'success',
        confirmButtonColor: '#4FD1C5'
      });
      
      handleUpdateGuideClose();
      fetchData();
    } catch (error) {
      console.error('Error updating guide:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to update tour guide',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  };

  // Handle filter menu open/close
  const handleTourFilterClick = (event) => {
    setTourFilterAnchorEl(event.currentTarget);
  };

  const handleTourFilterClose = () => {
    setTourFilterAnchorEl(null);
  };

  const handleGuideFilterClick = (event) => {
    setGuideFilterAnchorEl(event.currentTarget);
  };

  const handleGuideFilterClose = () => {
    setGuideFilterAnchorEl(null);
  };

  // Reset filters
  const resetTourFilters = () => {
    setTourFilters({
      difficulty: '',
      mealOptions: '',
      priceMin: '',
      priceMax: '',
      durationMin: '',
      durationMax: ''
    });
    setTourSearchQuery('');
  };

  const resetGuideFilters = () => {
    setGuideFilters({
      district: '',
      language: '',
      experienceMin: ''
    });
    setGuideSearchQuery('');
  };

  // Apply filters to tours and guides
  const getFilteredTours = () => {
    return tours.filter(tour => {
      // Search query filter
      const matchesSearch = 
        !tourSearchQuery || 
        tour.name.toLowerCase().includes(tourSearchQuery.toLowerCase()) ||
        (tour.description && tour.description.toLowerCase().includes(tourSearchQuery.toLowerCase())) ||
        (tour.tourGuide && tour.tourGuide.name.toLowerCase().includes(tourSearchQuery.toLowerCase()));
      
      // Difficulty filter
      const matchesDifficulty = !tourFilters.difficulty || tour.difficulty === tourFilters.difficulty;
      
      // Meal options filter
      const matchesMeals = !tourFilters.mealOptions || tour.mealOptions === tourFilters.mealOptions;
      
      // Price range filter
      const matchesPrice = 
        (!tourFilters.priceMin || tour.price >= Number(tourFilters.priceMin)) &&
        (!tourFilters.priceMax || tour.price <= Number(tourFilters.priceMax));
      
      // Duration range filter
      const matchesDuration = 
        (!tourFilters.durationMin || tour.duration >= Number(tourFilters.durationMin)) &&
        (!tourFilters.durationMax || tour.duration <= Number(tourFilters.durationMax));
      
      return matchesSearch && matchesDifficulty && matchesMeals && matchesPrice && matchesDuration;
    });
  };

  const getFilteredGuides = () => {
    return guides.filter(guide => {
      // Search query filter
      const matchesSearch = 
        !guideSearchQuery || 
        guide.name.toLowerCase().includes(guideSearchQuery.toLowerCase()) ||
        (guide.email && guide.email.toLowerCase().includes(guideSearchQuery.toLowerCase())) ||
        (guide.phone && guide.phone.includes(guideSearchQuery));
      
      // District filter
      const matchesDistrict = !guideFilters.district || guide.district === guideFilters.district;
      
      // Language filter
      const matchesLanguage = !guideFilters.language || 
        (guide.languages && guide.languages.some(lang => 
          lang.toLowerCase().includes(guideFilters.language.toLowerCase())
        ));
      
      // Experience filter
      const matchesExperience = !guideFilters.experienceMin || 
        guide.experience >= Number(guideFilters.experienceMin);
      
      return matchesSearch && matchesDistrict && matchesLanguage && matchesExperience;
    });
  };

  // Report generation functions
  const handleTourReport = () => {
    setTourReportOpen(true);
  };

  const handleGuideReport = () => {
    setGuideReportOpen(true);
  };

  const handlePrintReport = () => {
    // Determine what to print based on which dialog is open
    const isPrintingTours = tourReportOpen;
    const isPrintingGuides = guideReportOpen;
    
    // Get the data to print
    const dataToPrint = isPrintingTours ? getFilteredTours() : isPrintingGuides ? getFilteredGuides() : [];
    
    if (dataToPrint.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: `There are no ${isPrintingTours ? "tour packages" : "tour guides"} to print.`,
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Generate HTML content for printing
    let printContent = `
      <html>
      <head>
        <title>Ceylon Circuit - ${isPrintingTours ? "Tour Packages" : "Tour Guides"} Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            background-color: #0E374E;
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
          }
          .tagline {
            font-style: italic;
            margin: 5px 0 0;
          }
          .accent-bar {
            height: 5px;
            background-color: #4FD1C5;
            margin-bottom: 20px;
          }
          .report-title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #0E374E;
          }
          .item-card {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 15px;
            position: relative;
          }
          .item-card::before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 5px;
            background-color: #4FD1C5;
            border-radius: 5px 0 0 5px;
          }
          .item-title {
            font-size: 18px;
            font-weight: bold;
            color: #0E374E;
            margin-top: 0;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
          }
          .item-details {
            margin: 0;
            padding: 0;
          }
          .item-detail {
            margin-bottom: 5px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="company-name">Ceylon Circuit</h1>
          <p class="tagline">Discover the beauty of Sri Lanka with our AI-powered travel planning assistant.</p>
        </div>
        <div class="accent-bar"></div>
        
        <h2 class="report-title">${isPrintingTours ? "Tour Packages" : "Tour Guides"} Report</h2>
    `;
    
    // Add the items
    if (isPrintingTours) {
      // Add tour packages to print content
      dataToPrint.forEach(tour => {
        printContent += `
          <div class="item-card">
            <h3 class="item-title">${tour.name || 'Unnamed Tour'}</h3>
            <div class="item-details">
              <p class="item-detail"><strong>Duration:</strong> ${tour.duration || 'N/A'} days</p>
              <p class="item-detail"><strong>Price:</strong> $${tour.price || 'N/A'}</p>
              <p class="item-detail"><strong>Difficulty:</strong> ${tour.difficulty || 'Moderate'}</p>
              <p class="item-detail"><strong>Meal Options:</strong> ${tour.mealOptions || 'Bed & Breakfast'}</p>
              <p class="item-detail"><strong>Max Participants:</strong> ${tour.maxParticipants || 'N/A'}</p>
              <p class="item-detail"><strong>Tour Guide:</strong> ${tour.tourGuide ? tour.tourGuide.name : 'Not assigned'}</p>
              ${tour.description ? `<p class="item-detail"><strong>Description:</strong> ${tour.description.length > 150 ? tour.description.substring(0, 147) + '...' : tour.description}</p>` : ''}
              <p class="item-detail" style="font-size: 10px; color: #999;">ID: ${tour._id || 'N/A'}</p>
            </div>
          </div>
        `;
      });
    } else {
      // Add tour guides to print content
      dataToPrint.forEach(guide => {
        printContent += `
          <div class="item-card">
            <h3 class="item-title">${guide.name || 'Unnamed Guide'}</h3>
            <div class="item-details">
              <p class="item-detail"><strong>Email:</strong> ${guide.email || 'N/A'}</p>
              <p class="item-detail"><strong>Phone:</strong> ${guide.phone || 'N/A'}</p>
              <p class="item-detail"><strong>Experience:</strong> ${guide.experience || '0'} years</p>
              ${guide.district ? `<p class="item-detail"><strong>District:</strong> ${guide.district}</p>` : ''}
              ${guide.languages && guide.languages.length > 0 ? `<p class="item-detail"><strong>Languages:</strong> ${guide.languages.join(', ')}</p>` : ''}
              <p class="item-detail" style="font-size: 10px; color: #999;">ID: ${guide._id || 'N/A'}</p>
            </div>
          </div>
        `;
      });
    }
    
    // Add the footer
    printContent += `
        <div class="footer">
          <p>Report generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          <p>Contact Info: 123 Temple Road Colombo, Sri Lanka | Email: info@ceyloncircuit.com | Phone: +94 11 234 5678</p>
        </div>
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background-color: #0E374E; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Report</button>
          <button onclick="window.close()" style="padding: 10px 20px; background-color: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
        </div>
      </body>
      </html>
    `;
    
    // Write to the print window and trigger print
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Give the browser a moment to process the document before printing
    setTimeout(() => {
      printWindow.focus();
      // Let the user trigger the print dialog through the button we've added
      // This is more reliable than automatically calling print()
    }, 500);
  };

  // Render tours list tab
  const renderToursTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="medium">Tour Packages</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setCreatePackageOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Create New Package
        </Button>
      </Box>

      {/* Search and filter bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search packages by name, description, or guide..."
              value={tourSearchQuery}
              onChange={(e) => setTourSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: tourSearchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setTourSearchQuery('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Button
              fullWidth
              startIcon={<FilterListIcon />}
              onClick={handleTourFilterClick}
              variant="outlined"
              size="medium"
            >
              Filters
              {Object.values(tourFilters).some(val => val !== '') && (
                <Chip 
                  size="small" 
                  color="primary" 
                  label={Object.values(tourFilters).filter(val => val !== '').length} 
                  sx={{ ml: 1 }}
                />
              )}
            </Button>
            
            <Menu
              anchorEl={tourFilterAnchorEl}
              open={Boolean(tourFilterAnchorEl)}
              onClose={handleTourFilterClose}
              PaperProps={{
                sx: { width: 300, p: 2, mt: 1 }
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Filter Tour Packages
              </Typography>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={tourFilters.difficulty}
                  onChange={(e) => setTourFilters({...tourFilters, difficulty: e.target.value})}
                  label="Difficulty"
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="Easy">Easy</MenuItem>
                  <MenuItem value="Moderate">Moderate</MenuItem>
                  <MenuItem value="Challenging">Challenging</MenuItem>
                  <MenuItem value="Difficult">Difficult</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Meal Options</InputLabel>
                <Select
                  value={tourFilters.mealOptions}
                  onChange={(e) => setTourFilters({...tourFilters, mealOptions: e.target.value})}
                  label="Meal Options"
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="Full Board">Full Board</MenuItem>
                  <MenuItem value="Half Board">Half Board</MenuItem>
                  <MenuItem value="Bed & Breakfast">Bed & Breakfast</MenuItem>
                  <MenuItem value="Room Only">Room Only</MenuItem>
                  <MenuItem value="All Inclusive">All Inclusive</MenuItem>
                </Select>
              </FormControl>
              
              <Grid container spacing={1} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Min Price ($)"
                    type="number"
                    value={tourFilters.priceMin}
                    onChange={(e) => setTourFilters({...tourFilters, priceMin: e.target.value})}
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Max Price ($)"
                    type="number"
                    value={tourFilters.priceMax}
                    onChange={(e) => setTourFilters({...tourFilters, priceMax: e.target.value})}
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>
              
              <Grid container spacing={1} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Min Duration"
                    type="number"
                    value={tourFilters.durationMin}
                    onChange={(e) => setTourFilters({...tourFilters, durationMin: e.target.value})}
                    size="small"
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Max Duration"
                    type="number"
                    value={tourFilters.durationMax}
                    onChange={(e) => setTourFilters({...tourFilters, durationMax: e.target.value})}
                    size="small"
                    inputProps={{ min: 1 }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  color="secondary" 
                  onClick={resetTourFilters}
                  size="small"
                  startIcon={<ClearIcon />}
                >
                  Reset All
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleTourFilterClose}
                  size="small"
                >
                  Apply Filters
                </Button>
              </Box>
            </Menu>
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <Tooltip title="Generate PDF Report">
              <Button 
                fullWidth
                startIcon={<PdfIcon />}
                onClick={handleTourReport}
                variant="outlined"
                color="secondary"
                size="medium"
              >
                Report
              </Button>
            </Tooltip>
          </Grid>
          
          <Grid item xs={12}>
            {Object.values(tourFilters).some(val => val !== '') && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tourFilters.difficulty && (
                  <Chip
                    label={`Difficulty: ${tourFilters.difficulty}`}
                    onDelete={() => setTourFilters({...tourFilters, difficulty: ''})}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                
                {tourFilters.mealOptions && (
                  <Chip
                    label={`Meals: ${tourFilters.mealOptions}`}
                    onDelete={() => setTourFilters({...tourFilters, mealOptions: ''})}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                
                {(tourFilters.priceMin || tourFilters.priceMax) && (
                  <Chip 
                    label={`Price: ${tourFilters.priceMin || '0'}$ - ${tourFilters.priceMax || '∞'}$`}
                    onDelete={() => setTourFilters({...tourFilters, priceMin: '', priceMax: ''})}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                
                {(tourFilters.durationMin || tourFilters.durationMax) && (
                  <Chip 
                    label={`Duration: ${tourFilters.durationMin || '1'} - ${tourFilters.durationMax || '∞'} days`}
                    onDelete={() => setTourFilters({...tourFilters, durationMin: '', durationMax: ''})}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                
                <Button 
                  size="small" 
                  onClick={resetTourFilters}
                  sx={{ ml: 'auto' }}
                >
                  Clear All
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : getFilteredTours().length === 0 ? (
        <Alert severity="info">
          {tours.length === 0 
            ? "No tour packages found. Create your first tour package to get started."
            : "No tour packages match your search criteria. Try adjusting your filters."}
        </Alert>
      ) : (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Showing {getFilteredTours().length} of {tours.length} packages
            </Typography>
          </Box>
          
          <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
            <Table size="medium">
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Duration</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Price</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Difficulty</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Meal Options</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tour Guide</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredTours().map((tour) => (
                  <TableRow 
                    key={tour._id}
                    sx={{ 
                      '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                      '&:hover': { bgcolor: 'action.selected' },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'medium' }}>{tour.name}</TableCell>
                    <TableCell>{tour.duration} days</TableCell>
                    <TableCell>${tour.price}</TableCell>
                    <TableCell>{tour.difficulty || 'Moderate'}</TableCell>
                    <TableCell>{tour.mealOptions || 'Bed & Breakfast'}</TableCell>
                    <TableCell>
                      {tour.tourGuide?.name || 'Not assigned'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="info" 
                        onClick={() => handleViewTour(tour)}
                        title="View Details"
                        sx={{ mx: 0.5 }}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEditTour(tour)}
                        title="Edit Tour"
                        sx={{ mx: 0.5 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteTour(tour._id)}
                        title="Delete Tour"
                        sx={{ mx: 0.5 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
  
  // Render guides list tab
  const renderGuidesTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="medium">Tour Guides</Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/tours/addguides')}
          sx={{ borderRadius: 2 }}
        >
          Add New Guide
        </Button>
      </Box>

      {/* Search and filter bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search guides by name, email, or phone..."
              value={guideSearchQuery}
              onChange={(e) => setGuideSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: guideSearchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setGuideSearchQuery('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Button
              fullWidth
              startIcon={<FilterListIcon />}
              onClick={handleGuideFilterClick}
              variant="outlined"
              size="medium"
            >
              Filters
              {Object.values(guideFilters).some(val => val !== '') && (
                <Chip 
                  size="small" 
                  color="primary" 
                  label={Object.values(guideFilters).filter(val => val !== '').length} 
                  sx={{ ml: 1 }}
                />
              )}
            </Button>
            
            <Menu
              anchorEl={guideFilterAnchorEl}
              open={Boolean(guideFilterAnchorEl)}
              onClose={handleGuideFilterClose}
              PaperProps={{
                sx: { width: 300, p: 2, mt: 1 }
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Filter Tour Guides
              </Typography>
              
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>District</InputLabel>
                <Select
                  value={guideFilters.district}
                  onChange={(e) => setGuideFilters({...guideFilters, district: e.target.value})}
                  label="District"
                >
                  <MenuItem value="">Any</MenuItem>
                  {['Colombo', 'Gampaha', 'Kandy', 'Galle', 'Matara', 'Jaffna', 'Anuradhapura'].map(district => (
                    <MenuItem key={district} value={district}>{district}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Language"
                value={guideFilters.language}
                onChange={(e) => setGuideFilters({...guideFilters, language: e.target.value})}
                margin="dense"
                size="small"
                placeholder="e.g. English, French, etc."
              />
              
              <TextField
                fullWidth
                label="Minimum Experience (years)"
                type="number"
                value={guideFilters.experienceMin}
                onChange={(e) => setGuideFilters({...guideFilters, experienceMin: e.target.value})}
                margin="dense"
                size="small"
                inputProps={{ min: 0 }}
              />
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined" 
                  color="secondary" 
                  onClick={resetGuideFilters}
                  size="small"
                  startIcon={<ClearIcon />}
                >
                  Reset All
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleGuideFilterClose}
                  size="small"
                >
                  Apply Filters
                </Button>
              </Box>
            </Menu>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Tooltip title="Generate PDF Report">
              <Button 
                fullWidth
                startIcon={<PdfIcon />}
                onClick={handleGuideReport}
                variant="outlined" 
                color="secondary"
                size="medium"
              >
                Report
              </Button>
            </Tooltip>
          </Grid>
          
          <Grid item xs={12}>
            {Object.values(guideFilters).some(val => val !== '') && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {guideFilters.district && (
                  <Chip 
                    label={`District: ${guideFilters.district}`}
                    onDelete={() => setGuideFilters({...guideFilters, district: ''})}
                    size="small" 
                    color="primary"
                    variant="outlined" 
                  />
                )}
                
                {guideFilters.language && (
                  <Chip 
                    label={`Language: ${guideFilters.language}`}
                    onDelete={() => setGuideFilters({...guideFilters, language: ''})}
                    size="small" 
                    color="primary"
                    variant="outlined" 
                  />
                )}
                
                {guideFilters.experienceMin && (
                  <Chip 
                    label={`Min Experience: ${guideFilters.experienceMin} years`}
                    onDelete={() => setGuideFilters({...guideFilters, experienceMin: ''})}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                
                <Button 
                  size="small" 
                  onClick={resetGuideFilters}
                  sx={{ ml: 'auto' }}
                >
                  Clear All
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : getFilteredGuides().length === 0 ? (
        <Alert severity="info">
          {guides.length === 0 
            ? "No tour guides found. Add your first tour guide to get started."
            : "No tour guides match your search criteria. Try adjusting your filters."}
        </Alert>
      ) : (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Showing {getFilteredGuides().length} of {guides.length} guides
            </Typography>
          </Box>
          
          <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
            <Table size="medium">
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Guide</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Languages</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Experience</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredGuides().map((guide) => (
                  <TableRow 
                    key={guide._id}
                    sx={{ 
                      '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                      '&:hover': { bgcolor: 'action.selected' },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {guide.image ? (
                          <Box
                            component="img"
                            src={`http://localhost:5000/uploads/${guide.image}`}
                            alt={guide.name}
                            sx={{ 
                              width: 50, 
                              height: 50, 
                              borderRadius: '50%',
                              mr: 2,
                              objectFit: 'cover',
                              border: '1px solid #ddd'
                            }}
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/50?text=Guide";
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 50,
                              height: 50,
                              borderRadius: '50%',
                              bgcolor: 'primary.light',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.2rem',
                              fontWeight: 'bold',
                              mr: 2
                            }}
                          >
                            {guide.name.charAt(0)}
                          </Box>
                        )}
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {guide.name}
                          </Typography>
                          {guide.district && (
                            <Typography variant="caption" color="text.secondary">
                              {guide.district}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" gutterBottom>{guide.email}</Typography>
                      <Typography variant="body2">{guide.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {guide.languages && guide.languages.map((lang) => (
                          <Chip 
                            key={lang} 
                            label={lang} 
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${guide.experience} years`} 
                        size="small" 
                        color="secondary"
                        sx={{ fontWeight: 'medium' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEditGuide(guide)}
                        title="Edit Guide"
                        sx={{ mx: 0.5 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteGuide(guide._id)}
                        title="Delete Guide"
                        sx={{ mx: 0.5 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );

  // Tour detail dialog
  const renderTourDetailDialog = () => {
    if (!selectedTour) return null;
    
    return (
          <Dialog 
        open={viewTourOpen}
        onClose={() => setViewTourOpen(false)}
        maxWidth="md"
                      fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
            m: { xs: 1, sm: 2 },
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h5" component="div" fontWeight="bold">
            {selectedTour.name}
                    </Typography>
          <Chip 
            label={selectedTour.difficulty || 'Moderate'} 
            color="secondary" 
            sx={{ fontWeight: 'bold' }} 
          />
        </DialogTitle>
        
        <DialogContent dividers>
          <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', mb: 3 }}>
            {selectedTour.description}
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 1 }}>Duration:</Typography>
                <Typography variant="body1">{selectedTour.duration} days</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 1 }}>Price:</Typography>
                <Typography variant="body1">${selectedTour.price}</Typography>
              </Box>
                  </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 1 }}>Difficulty:</Typography>
                <Typography variant="body1">{selectedTour.difficulty || 'Moderate'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 1 }}>Meal Options:</Typography>
                <Typography variant="body1">{selectedTour.mealOptions || 'Bed & Breakfast'}</Typography>
              </Box>
                  </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 1 }}>Max Participants:</Typography>
                <Typography variant="body1">{selectedTour.maxParticipants}</Typography>
              </Box>
                  </Grid>
                  </Grid>

          {selectedTour.tourGuide && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      Tour Guide
                    </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    bgcolor: 'primary.light',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    mr: 2
                  }}
                >
                  {selectedTour.tourGuide.name.charAt(0)}
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">{selectedTour.tourGuide.name}</Typography>
                  <Typography variant="body2">{selectedTour.tourGuide.email}</Typography>
                  <Typography variant="body2">{selectedTour.tourGuide.phone}</Typography>
                </Box>
              </Box>
            </Box>
          )}
          
          {selectedTour.dailyItineraries && selectedTour.dailyItineraries.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Daily Itinerary
                      </Typography>
              
              {selectedTour.dailyItineraries.map((day, index) => (
                <Paper key={`day-${index}`} sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: 2 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: 'white', 
                    bgcolor: 'primary.main', 
                    p: 1, 
                    borderRadius: 1,
                    mb: 2
                  }}>
                    Day {day.day}
                          </Typography>
                  
                  {day.destinations && day.destinations.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Destinations:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {day.destinations.map((dest, i) => (
                              <Chip
                            key={`dest-${i}`} 
                            label={dest.name || `Unknown (ID: ${typeof dest === 'string' ? dest.slice(-5) : 'N/A'})`} 
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 'medium' }}
                              />
                            ))}
                          </Box>
                        </Box>
                  )}

                  {day.accommodations && day.accommodations.length > 0 && (
                        <Box>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Accommodations:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {day.accommodations.map((acc, i) => (
                              <Chip
                            key={`acc-${i}`} 
                            label={acc.accName || `Unknown (ID: ${typeof acc === 'string' ? acc.slice(-5) : 'N/A'})`} 
                            color="secondary"
                            variant="outlined"
                            sx={{ fontWeight: 'medium' }}
                              />
                            ))}
                          </Box>
                          </Box>
                        )}
                      </Paper>
                            ))}
                          </Box>
                        )}
              </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
                      <Button
            onClick={() => setViewTourOpen(false)} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Close
                      </Button>
                <Button 
            onClick={() => handleEditTour(selectedTour)} 
                  variant="contained" 
                  color="primary"
            startIcon={<EditIcon />}
            sx={{ borderRadius: 2 }}
                >
            Edit Tour
                </Button>
              </DialogActions>
          </Dialog>
    );
  };
  
  // Tour report dialog
  const renderTourReportDialog = () => {
    const generatePDF = () => {
      // Check if there's data to generate a PDF
      if (!getFilteredTours() || getFilteredTours().length === 0) {
        Swal.fire({
          icon: "warning",
          title: "No Data",
          text: "There are no tour packages to include in the report.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      const doc = new jsPDF();
    
      // Define colors 
      const primaryColor = [14, 55, 78]; // #0E374E dark blue
      const accentColor = [79, 209, 197]; // #4FD1C5 teal
      const textColor = [60, 60, 60]; // Dark gray for text
      const lightGray = [240, 240, 240]; // Light gray for backgrounds
      
      // Set default styles
      doc.setFont("helvetica");
      doc.setFontSize(10);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      // Function to add page setup (header/footer)
      const addPageSetup = (pageNum, totalPages) => {
        // Header background
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 30, 'F');
        
        // Company name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text('Ceylon Circuit', 14, 15);
        
        // Tagline
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text('Discover the beauty of Sri Lanka with our AI-powered travel planning assistant.', 14, 22);
        
        // Add a colored accent bar
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.rect(0, 30, 210, 3, 'F');
        
        // Title of report
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text('Tour Packages Report', 105, 45, { align: 'center' });
    
        // Footer with contact info
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.rect(0, 280, 210, 17, 'F');
        
        doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.setLineWidth(0.5);
        doc.line(0, 280, 210, 280);
        
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        
        // Contact information in footer
        doc.text('Contact Info: 123 Temple Road Colombo, Sri Lanka', 14, 285);
        doc.text('Email: info@ceyloncircuit.com', 14, 290);
        doc.text('Phone: +94 11 234 5678', 14, 295);
        
        // Page number
        doc.text(`Page ${pageNum} of ${totalPages}`, 185, 295);
        
        // Report generation date
        doc.setFont("helvetica", "italic");
        doc.text(`Report generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, 285, { align: 'center' });
        
        // Reset text color for content
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFont("helvetica", "normal");
      };
      
      // Calculate total pages based on tours (assuming each takes about 80 points of height)
      const itemsPerPage = 3;
      const toursToInclude = getFilteredTours();
      const totalPages = Math.ceil(toursToInclude.length / itemsPerPage);
      
      let currentPage = 1;
      let yPosition = 60; // Start position after header
      
      // Add first page setup
      addPageSetup(currentPage, totalPages);
      
      // Process each tour for the PDF
      toursToInclude.forEach((tour, index) => {
        // Check if we need a new page
        if (index > 0 && index % itemsPerPage === 0) {
          doc.addPage();
          currentPage++;
          addPageSetup(currentPage, totalPages);
          yPosition = 60; // Reset Y position after header
        }
    
        // Card background with shadow effect
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(200, 200, 200);
        doc.roundedRect(14, yPosition, 180, 70, 3, 3, 'FD');
        
        // Add a colored accent on the left
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.rect(14, yPosition, 4, 70, 'F');
    
        // Tour name (title of the card)
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(tour.name || 'Unnamed Tour', 24, yPosition + 12);
        
        // Horizontal divider
        doc.setDrawColor(200, 200, 200);
        doc.line(24, yPosition + 16, 184, yPosition + 16);
    
        // Tour details
        doc.setFont("helvetica", "normal");
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(10);
        
        // Two-column layout for details
        const leftCol = 24;
        const rightCol = 105;
        
        // First row
        doc.setFontSize(11);
        doc.text(`Duration: ${tour.duration || 'N/A'} days`, leftCol, yPosition + 25);
        doc.text(`Price: $${tour.price || 'N/A'}`, rightCol, yPosition + 25);
        
        // Second row
        doc.setFontSize(10);
        doc.text(`Difficulty: ${tour.difficulty || 'Moderate'}`, leftCol, yPosition + 35);
        doc.text(`Meal Options: ${tour.mealOptions || 'Bed & Breakfast'}`, rightCol, yPosition + 35);
        
        // Third row
        doc.text(`Max Participants: ${tour.maxParticipants || 'N/A'}`, leftCol, yPosition + 45);
        
        // Tour guide
        if (tour.tourGuide) {
          doc.text(`Tour Guide: ${tour.tourGuide.name || 'Not assigned'}`, leftCol, yPosition + 55);
        } else {
          doc.text(`Tour Guide: Not assigned`, leftCol, yPosition + 55);
        }
        
        // Description with wrapping
        if (tour.description) {
          const descriptionTitle = "Description: ";
          doc.text(descriptionTitle, leftCol, yPosition + 65);
          
          // Truncate description if it's too long
          let description = tour.description;
          if (description.length > 100) {
            description = description.substring(0, 97) + '...';
          }
          
          const maxWidth = 160;
          const descriptionList = doc.splitTextToSize(description, maxWidth);
          doc.text(descriptionList, leftCol + doc.getTextWidth(descriptionTitle), yPosition + 65);
        }
        
        // Add ID for reference
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(`ID: ${tour._id || 'N/A'}`, 174, yPosition + 12, { align: 'right' });
        
        // Move to next card position
        yPosition += 80;
      });
    
      // Save the generated PDF
      doc.save('ceylon_circuit_tours_report.pdf');
      setTourReportOpen(false);
    };

    return (
      <Dialog
        open={tourReportOpen}
        onClose={() => setTourReportOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 2,
            m: { xs: 1, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h5" fontWeight="bold">Tour Packages Report</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" paragraph>
            Generate a PDF report of all tour packages{tourSearchQuery || Object.values(tourFilters).some(val => val !== '') 
              ? ' based on your current filters' 
              : ''}.
          </Typography>
          <Typography variant="body1" paragraph>
            The report will include {getFilteredTours().length} tour packages with details such as name,
            duration, price, difficulty level, and assigned tour guide.
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Tooltip title="Opens a printable view in a new window">
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<PrintIcon />}
                onClick={handlePrintReport}
              >
                Print Preview
              </Button>
            </Tooltip>
            <Tooltip title="Downloads a PDF file to your computer">
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<PdfIcon />}
                onClick={generatePDF}
              >
                Download PDF
              </Button>
            </Tooltip>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setTourReportOpen(false)}
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Guide report dialog (similar to tour report)
  const renderGuideReportDialog = () => {
    const generatePDF = () => {
      // Check if there's data to generate a PDF
      if (!getFilteredGuides() || getFilteredGuides().length === 0) {
        Swal.fire({
          icon: "warning",
          title: "No Data",
          text: "There are no tour guides to include in the report.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      const doc = new jsPDF();
    
      // Define colors 
      const primaryColor = [14, 55, 78]; // #0E374E dark blue
      const accentColor = [79, 209, 197]; // #4FD1C5 teal
      const textColor = [60, 60, 60]; // Dark gray for text
      const lightGray = [240, 240, 240]; // Light gray for backgrounds
      
      // Set default styles
      doc.setFont("helvetica");
      doc.setFontSize(10);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      // Function to add page setup (header/footer)
      const addPageSetup = (pageNum, totalPages) => {
        // Header background
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 30, 'F');
        
        // Company name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text('Ceylon Circuit', 14, 15);
        
        // Tagline
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text('Discover the beauty of Sri Lanka with our AI-powered travel planning assistant.', 14, 22);
        
        // Add a colored accent bar
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.rect(0, 30, 210, 3, 'F');
        
        // Title of report
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text('Tour Guides Report', 105, 45, { align: 'center' });
    
        // Footer with contact info
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.rect(0, 280, 210, 17, 'F');
        
        doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.setLineWidth(0.5);
        doc.line(0, 280, 210, 280);
        
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        
        // Contact information in footer
        doc.text('Contact Info: 123 Temple Road Colombo, Sri Lanka', 14, 285);
        doc.text('Email: info@ceyloncircuit.com', 14, 290);
        doc.text('Phone: +94 11 234 5678', 14, 295);
        
        // Page number
        doc.text(`Page ${pageNum} of ${totalPages}`, 185, 295);
        
        // Report generation date
        doc.setFont("helvetica", "italic");
        doc.text(`Report generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, 285, { align: 'center' });
        
        // Reset text color for content
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFont("helvetica", "normal");
      };
      
      // Calculate total pages based on guides (assuming each takes about 80 points of height)
      const itemsPerPage = 3;
      const guidesToInclude = getFilteredGuides();
      const totalPages = Math.ceil(guidesToInclude.length / itemsPerPage);
      
      let currentPage = 1;
      let yPosition = 60; // Start position after header
      
      // Add first page setup
      addPageSetup(currentPage, totalPages);
      
      // Process each guide for the PDF
      guidesToInclude.forEach((guide, index) => {
        // Check if we need a new page
        if (index > 0 && index % itemsPerPage === 0) {
          doc.addPage();
          currentPage++;
          addPageSetup(currentPage, totalPages);
          yPosition = 60; // Reset Y position after header
        }
    
        // Card background with shadow effect
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(200, 200, 200);
        doc.roundedRect(14, yPosition, 180, 70, 3, 3, 'FD');
        
        // Add a colored accent on the left
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.rect(14, yPosition, 4, 70, 'F');
    
        // Guide name (title of the card)
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(guide.name || 'Unnamed Guide', 24, yPosition + 12);
        
        // Horizontal divider
        doc.setDrawColor(200, 200, 200);
        doc.line(24, yPosition + 16, 184, yPosition + 16);
    
        // Guide details
        doc.setFont("helvetica", "normal");
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(10);
        
        // Contact info
        doc.setFontSize(11);
        doc.text(`Email: ${guide.email || 'N/A'}`, 24, yPosition + 25);
        doc.text(`Phone: ${guide.phone || 'N/A'}`, 24, yPosition + 35);
        
        // Experience
        doc.text(`Experience: ${guide.experience || 0} years`, 24, yPosition + 45);
        
        // District
        if (guide.district) {
          doc.text(`District: ${guide.district}`, 24, yPosition + 55);
        }
        
        // Languages
        if (guide.languages && guide.languages.length > 0) {
          const languagesStr = `Languages: ${guide.languages.join(', ')}`;
          doc.text(languagesStr, 24, yPosition + 65);
        }
        
        // Add ID for reference
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(`ID: ${guide._id || 'N/A'}`, 174, yPosition + 12, { align: 'right' });
        
        // Move to next card position
        yPosition += 80;
      });
    
      // Save the generated PDF
      doc.save('ceylon_circuit_guides_report.pdf');
      setGuideReportOpen(false);
    };

    return (
      <Dialog
        open={guideReportOpen}
        onClose={() => setGuideReportOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 2,
            m: { xs: 1, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h5" fontWeight="bold">Tour Guides Report</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" paragraph>
            Generate a PDF report of all tour guides{guideSearchQuery || Object.values(guideFilters).some(val => val !== '') 
              ? ' based on your current filters' 
              : ''}.
          </Typography>
          <Typography variant="body1" paragraph>
            The report will include {getFilteredGuides().length} tour guides with details such as name,
            contact information, experience, and languages spoken.
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Tooltip title="Opens a printable view in a new window">
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<PrintIcon />}
                onClick={handlePrintReport}
              >
                Print Preview
              </Button>
            </Tooltip>
            <Tooltip title="Downloads a PDF file to your computer">
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<PdfIcon />}
                onClick={generatePDF}
              >
                Download PDF
              </Button>
            </Tooltip>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setGuideReportOpen(false)}
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Handle report close
  const handleReportClose = () => {
    setTourReportOpen(false);
    setGuideReportOpen(false);
  };
  
  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 10, sm: 12 }, mb: 4 }}>
      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mt: 3 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={handleBackToAdmin} 
              variant="outlined"
              sx={{ mr: 2 }}
            >
              Back to Admin
            </Button>
            <Typography variant="h5" component="h1">
              Tour Management
            </Typography>
          </Box>
          {tabValue === 0 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setCreatePackageOpen(true)}
            >
              Create Tour Package
            </Button>
          )}
          {tabValue === 1 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/tours/addguides')}
            >
              Add Tour Guide
            </Button>
          )}
        </Box>
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Tour Packages" />
          <Tab label="Tour Guides" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          {renderToursTab()}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {renderGuidesTab()}
        </TabPanel>
            </Paper>
      
      {/* Tour package builder dialog */}
      <Dialog
        open={createPackageOpen}
        onClose={() => setCreatePackageOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            m: { xs: 1, sm: 2 },
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h5">Create New Tour Package</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <TourPackageBuilder onTourCreated={handleTourCreated} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreatePackageOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Tour detail dialog */}
      {renderTourDetailDialog()}
      
      {/* Guide update dialog */}
      <Dialog
        open={updateGuideOpen}
        onClose={handleUpdateGuideClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 2,
            m: { xs: 1, sm: 2 },
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h5" fontWeight="bold">Update Tour Guide</Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Name"
                value={updatedGuide.name}
                onChange={(e) => setUpdatedGuide({ ...updatedGuide, name: e.target.value })}
                      fullWidth
                margin="normal"
                variant="outlined"
                    />
                    <TextField
                      label="Email"
                value={updatedGuide.email}
                onChange={(e) => setUpdatedGuide({ ...updatedGuide, email: e.target.value })}
                      fullWidth
                margin="normal"
                variant="outlined"
                    />
                    <TextField
                      label="Phone"
                value={updatedGuide.phone}
                onChange={(e) => setUpdatedGuide({ ...updatedGuide, phone: e.target.value })}
                      fullWidth
                margin="normal"
                variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                label="Languages (comma separated)"
                value={updatedGuide.languages}
                onChange={(e) => setUpdatedGuide({ ...updatedGuide, languages: e.target.value })}
                fullWidth
                margin="normal"
                variant="outlined"
                helperText="Enter languages separated by commas, e.g., English, Sinhala, Tamil"
              />
              <TextField
                      label="Experience (years)"
                      type="number"
                value={updatedGuide.experience}
                onChange={(e) => setUpdatedGuide({ ...updatedGuide, experience: e.target.value })}
                      fullWidth
                margin="normal"
                variant="outlined"
                inputProps={{ min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                label="Description / Bio"
                value={updatedGuide.description}
                onChange={(e) => setUpdatedGuide({ ...updatedGuide, description: e.target.value })}
                      fullWidth
                margin="normal"
                variant="outlined"
                      multiline
                      rows={4}
                    />
                  </Grid>
                  <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                        Guide Photo
                      </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                {selectedGuide?.image && (
                  <Box
                    component="img"
                    src={`http://localhost:5000/uploads/${selectedGuide.image}`}
                    alt="Current Guide"
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      borderRadius: 2,
                      objectFit: 'cover',
                      border: '1px solid #ddd'
                    }}
                    onError={(e) => {
                      console.error("Image failed to load");
                      e.target.src = "https://via.placeholder.com/120?text=No+Image";
                    }}
                  />
                )}
                <Box sx={{ flex: 1 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{ mb: 1 }}
                    fullWidth
                  >
                    Choose New Image
                      <input 
                        type="file" 
                      hidden
                        accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setUpdatedGuide({ ...updatedGuide, image: file });
                        }
                      }}
                    />
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    {updatedGuide.image ? `Selected: ${updatedGuide.image.name}` : 'No new image selected'}
                  </Typography>
                </Box>
                    </Box>
                  </Grid>
                </Grid>
              </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
                <Button 
            onClick={handleUpdateGuideClose}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateGuide} 
                  variant="contained" 
                  color="primary"
            sx={{ borderRadius: 2 }}
                >
            Update Guide
                </Button>
              </DialogActions>
          </Dialog>
      
      {/* Tour report dialog */}
      {renderTourReportDialog()}
      
      {/* Guide report dialog */}
      {renderGuideReportDialog()}
    </Container>
  );
};

export default TourManagement; 