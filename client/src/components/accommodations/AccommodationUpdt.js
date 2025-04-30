import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Avatar, Grid, CircularProgress, IconButton, Card, CardContent, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel, Chip, OutlinedInput, Slider, Divider } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HotelIcon from '@mui/icons-material/Hotel';
import WifiIcon from '@mui/icons-material/Wifi';
import Swal from "sweetalert2";
import { fetchAccommodations, deleteAccommodation } from '../../redux/slices/accSlice';
import EditIcon from '@mui/icons-material/Edit';
import { jsPDF } from 'jspdf';  // Import jsPDF
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook for navigation

// Define locations and facilities for filters
const locations = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota",
  "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale",
  "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", 
  "Trincomalee", "Vavuniya"
];

const facilityOptions = [
  "WiFi", "Parking", "Swimming Pool", "Gym", "Laundry Service", "24/7 Security"
];

const AccommodationUpdt = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [accommodationsData, setAccommodations] = useState([]);
  const [filteredAccommodations, setFilteredAccommodations] = useState([]);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [facilitiesFilter, setFacilitiesFilter] = useState([]);
  const [roomCountRange, setRoomCountRange] = useState([0, 20]);

  // Check if user has admin access
  const isAdmin = user && user.isAdmin;

  const handleDeleteClick = (id) => {
    // Check if user is authenticated and is admin before allowing delete
    if (!isAuthenticated || !isAdmin) {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "You must be logged in as an administrator to delete accommodations.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      console.log(`Deleting accommodation with ID: ${deleteId}`);
      await dispatch(deleteAccommodation(deleteId)).unwrap();
      setOpenDeleteDialog(false);
      Swal.fire({
              icon: "success",
              title: "Success!",
              text: "Accommodation deleted successfully!",
              confirmButtonColor: "#3085d6",
            });
      getAccommodations();
    } catch (error) {
      setOpenDeleteDialog(false);
      Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message || "Accommodation deletion failed. Please try again.",
              });
      console.error("Failed to delete accommodation:", error);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
  };

  const getAccommodations = async () => {
    try {
      setIsPageLoaded(true);
      const response = await dispatch(fetchAccommodations()).unwrap();
      console.log("Accommodation response:", response);
      
      // Check if response is an array or if it's nested in a 'data' property
      let accommodations = [];
      if (Array.isArray(response)) {
        accommodations = response;
      } else if (response && response.data) {
        accommodations = response.data;
      } else {
        console.error("Unexpected response format:", response);
      }
      
      setAccommodations(accommodations);
      setFilteredAccommodations(accommodations);
    } catch (error) {
      console.error("Failed to fetch accommodations:", error);
      setAccommodations([]);
      setFilteredAccommodations([]);
    } finally {
      setIsPageLoaded(false);
    }
  };

  // Apply filters to accommodations
  const applyFilters = () => {
    let filtered = [...accommodationsData];
    
    // Apply search query filter (case insensitive)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(acc => 
        acc.accName?.toLowerCase().includes(query) || 
        acc.location?.toLowerCase().includes(query) || 
        acc.address?.toLowerCase().includes(query)
      );
    }
    
    // Apply location filter
    if (locationFilter) {
      filtered = filtered.filter(acc => acc.location === locationFilter);
    }
    
    // Apply facilities filter
    if (facilitiesFilter.length > 0) {
      filtered = filtered.filter(acc => {
        // If accommodation has no facilities, return false
        if (!acc.facilities || !Array.isArray(acc.facilities)) return false;
        
        // Check if accommodation has at least one of the selected facilities
        return facilitiesFilter.some(facility => 
          acc.facilities.includes(facility)
        );
      });
    }
    
    // Apply room count range filter
    filtered = filtered.filter(acc => {
      const totalRooms = (Number(acc.availableSingleRooms) || 0) + 
                          (Number(acc.availableDoubleRooms) || 0);
      return totalRooms >= roomCountRange[0] && totalRooms <= roomCountRange[1];
    });
    
    setFilteredAccommodations(filtered);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setLocationFilter('');
    setFacilitiesFilter([]);
    setRoomCountRange([0, 20]);
    setFilteredAccommodations(accommodationsData);
  };

  // Effect to apply filters when filter criteria change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, locationFilter, facilitiesFilter, roomCountRange]);

  useEffect(() => {
    getAccommodations();
  }, []);

  const handleFacilitiesChange = (event) => {
    const { value } = event.target;
    setFacilitiesFilter(typeof value === 'string' ? value.split(',') : value);
  };

  const handleEditClick = (acc) => {
    // Check if user is authenticated and is admin before allowing edit
    if (!isAuthenticated || !isAdmin) {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "You must be logged in as an administrator to edit accommodations.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    
    localStorage.setItem("accommodation", JSON.stringify(acc));
    navigate(`/edit-accommodation`);
  };

  // Function to generate PDF
  const generatePDF = () => {
    // Check if there's data to generate a PDF
    if (!filteredAccommodations || filteredAccommodations.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "There are no accommodations to include in the report.",
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
      doc.text('Accommodation Report', 105, 45, { align: 'center' });
  
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
    
    // Calculate total pages based on accommodations (assuming each takes about 80 points of height)
    const itemsPerPage = 3;
    const totalPages = Math.ceil(filteredAccommodations.length / itemsPerPage);
    
    let currentPage = 1;
    let yPosition = 60; // Start position after header
    
    // Add first page setup
    addPageSetup(currentPage, totalPages);
    
    // Process each accommodation for the PDF
    filteredAccommodations.forEach((acc, index) => {
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
  
      // Accommodation name (title of the card)
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(acc.accName || 'Unnamed Accommodation', 24, yPosition + 12);
      
      // Horizontal divider
      doc.setDrawColor(200, 200, 200);
      doc.line(24, yPosition + 16, 184, yPosition + 16);
  
      // Accommodation details
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(10);
      
      // Location with icon placeholder
      doc.setFontSize(11);
      doc.text(`Location: ${acc.location || 'N/A'}`, 24, yPosition + 25);
      
      // Two-column layout for details
      const leftCol = 24;
      const rightCol = 105;
      
      doc.setFontSize(10);
      doc.text(`Address: ${acc.address || 'N/A'}`, leftCol, yPosition + 35);
      doc.text(`Available Single Rooms: ${acc.availableSingleRooms || 0}`, leftCol, yPosition + 45);
      doc.text(`Available Double Rooms: ${acc.availableDoubleRooms || 0}`, leftCol, yPosition + 55);
      
      // Only show total rooms if available
      if (acc.availableRooms) {
        doc.text(`Total Rooms: ${acc.availableRooms}`, rightCol, yPosition + 35);
      }
      
      // Format facilities as a comma-separated list
      let facilitiesText = 'None';
      if (acc.facilities && acc.facilities.length > 0) {
        facilitiesText = acc.facilities.join(', ');
      }
      
      // Handle long facilities text with wrapping
      const facilitiesTitle = "Facilities: ";
      doc.text(facilitiesTitle, leftCol, yPosition + 65);
      
      const maxWidth = 160;
      const facilitiesList = doc.splitTextToSize(facilitiesText, maxWidth);
      doc.text(facilitiesList, leftCol + doc.getTextWidth(facilitiesTitle), yPosition + 65);
      
      // Add ID for reference
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(`ID: ${acc._id || 'N/A'}`, 174, yPosition + 12, { align: 'right' });
      
      // Move to next card position
      yPosition += 80;
    });
  
    // Save the generated PDF
    doc.save('ceylon_circuit_accommodations_report.pdf');
  };

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
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)'
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4
            }}
          >
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: '#4FD1C5',
                fontSize: '0.8rem',
                mb: 2,
                border: '4px solid #fff',
                boxShadow: '0 4px 14px rgba(79, 209, 197, 0.2)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              Accommodation
            </Avatar>
            <Typography
              variant="h4"
              sx={{
                color: '#0E374E',
                fontSize: '1rem',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 100,
                mb: 1
              }}
            >
              List
            </Typography>
          </Box>

          {/* Search and Filter Section */}
          <Box sx={{ mb: 4 }}>
            {/* Search Bar */}
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search accommodations by name, location, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      startIcon={<FilterListIcon />}
                      onClick={() => setShowFilters(!showFilters)}
                      color="primary"
                      variant={showFilters ? "contained" : "outlined"}
                      size="small"
                    >
                      {showFilters ? "Hide Filters" : "Show Filters"}
                    </Button>
                  </InputAdornment>
                )
              }}
            />

            {/* Filter Panel */}
            {showFilters && (
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, color: '#0E374E', fontWeight: 600 }}>
                  Filter Accommodations
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Location Filter */}
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id="location-filter-label">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                          Location
                        </Box>
                      </InputLabel>
                      <Select
                        labelId="location-filter-label"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        input={<OutlinedInput label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                            Location
                          </Box>
                        } />}
                      >
                        <MenuItem value="">
                          <em>All Locations</em>
                        </MenuItem>
                        {locations.map((location) => (
                          <MenuItem key={location} value={location}>
                            {location}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Facilities Filter */}
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id="facilities-filter-label">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <WifiIcon fontSize="small" sx={{ mr: 1 }} />
                          Facilities
                        </Box>
                      </InputLabel>
                      <Select
                        labelId="facilities-filter-label"
                        multiple
                        value={facilitiesFilter}
                        onChange={handleFacilitiesChange}
                        input={<OutlinedInput label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <WifiIcon fontSize="small" sx={{ mr: 1 }} />
                            Facilities
                          </Box>
                        } />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {facilityOptions.map((facility) => (
                          <MenuItem key={facility} value={facility}>
                            {facility}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Room Count Filter */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ px: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <HotelIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography>Total Room Count: {roomCountRange[0]} - {roomCountRange[1]}</Typography>
                      </Box>
                      <Slider
                        value={roomCountRange}
                        onChange={(e, newValue) => setRoomCountRange(newValue)}
                        valueLabelDisplay="auto"
                        min={0}
                        max={20}
                        sx={{ mt: 2 }}
                      />
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={resetFilters}
                    sx={{ mr: 1 }}
                  >
                    Reset Filters
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={applyFilters}
                  >
                    Apply Filters
                  </Button>
                </Box>
              </Paper>
            )}
          </Box>

          {/* Loading Indicator */}
          {isPageLoaded ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress size={50} color="primary" />
            </Box>
          ) : (
            <Box sx={{ mt: 4 }}>
              {/* Button to generate PDF */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
              <Button
              variant="contained"
              color="primary"
              onClick={generatePDF}
            >
              Generate PDF Report
            </Button>
                <Typography variant="body2" color="textSecondary">
                  Showing {filteredAccommodations.length} of {accommodationsData.length} accommodations
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {filteredAccommodations.length > 0 ? (
              <Grid container spacing={2}>
                  {filteredAccommodations.map((acc, index) => (
                  <Grid item xs={12} key={index}>
                    <Card sx={{ display: "flex", justifyContent: "space-between", p: 2, borderRadius: "12px", boxShadow: 3 }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight={600}>{acc.accName}</Typography>
                        <Typography variant="body2" color="textSecondary">Accommodation Name: {acc.accName}</Typography>
                        <Typography variant="body2" color="textSecondary">Location: {acc.location}</Typography>
                        <Typography variant="body2" color="textSecondary">Address: {acc.address}</Typography>
                        <Typography variant="body2" color="textSecondary">Available Single Rooms: {acc.availableSingleRooms}</Typography>
                        <Typography variant="body2" color="textSecondary">Available Double Rooms: {acc.availableDoubleRooms}</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                            {acc.facilities && acc.facilities.map((facility) => (
                              <Chip 
                                key={facility} 
                                label={facility} 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                              />
                            ))}
                          </Box>
                      </CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEditClick(acc)}
                            sx={{ mb: 1 }}
                          >
                          <EditIcon />
                        </IconButton>
                          <IconButton 
                            color="error" 
                        onClick={() => handleDeleteClick(acc._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography variant="h6">No accommodations found</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Try adjusting your search criteria or filters
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={resetFilters}
                    sx={{ mt: 2 }}
                  >
                    Reset Filters
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Container>

            {/* Confirmation Dialog for Deleting */}
            <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure you want to delete this accommodation?"}
        </DialogTitle>
        <DialogContent>
          <p>Once deleted, this action cannot be undone.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccommodationUpdt;
