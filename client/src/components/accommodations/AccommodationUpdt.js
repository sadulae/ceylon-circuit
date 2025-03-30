import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Avatar, Grid, CircularProgress, IconButton, Card, CardContent, Button, Dialog, DialogActions, DialogContent, DialogTitle,  } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from "sweetalert2";
import { fetchAccommodations, deleteAccommodation } from '../../redux/slices/accSlice';
import EditIcon from '@mui/icons-material/Edit';
import { jsPDF } from 'jspdf';  // Import jsPDF
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook for navigation

const AccommodationUpdt = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [accommodationsData, setAccommodations] = useState([]);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const handleDeleteClick = (id) => {
    setDeleteId(id); // Store the ID of the accommodation to delete
    setOpenDeleteDialog(true); // Open the confirmation dialog
  };

  const handleDeleteConfirm = async () => {
    try {
      // Call your delete API or dispatch a Redux action here
      console.log(`Deleting accommodation with ID: ${deleteId}`);
      // Example: dispatch(deleteAccommodation(deleteId));
      await dispatch(deleteAccommodation(deleteId)).unwrap();
      setOpenDeleteDialog(false);
      Swal.fire({
              icon: "success",
              title: "Success!",
              text: "Accommodation deleted successfully!",
              confirmButtonColor: "#3085d6",
            });
      getAccommodations();
      // After successful deletion, close the dialog and update the state (if needed)
      // setAccommodations((prevData) => prevData.filter((acc) => acc.id !== deleteId));
       // Close the dialog
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
    setOpenDeleteDialog(false); // Close the dialog without deleting
  };

  const getAccommodations = async () => {
    try {
      setIsPageLoaded(true);
      const response = await dispatch(fetchAccommodations()).unwrap();
      setAccommodations(response);
    } catch (error) {
      console.error("Failed to fetch accommodations:", error);
    } finally {
      setIsPageLoaded(false);
    }
  };

  useEffect(() => {
    getAccommodations();
  }, []);

  // Function to generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
  
    // Set up fonts and general styles
    doc.setFont("helvetica");
    doc.setFontSize(14);
  
    // Add "Ceylon Circuit" as a header at the top
    doc.setTextColor(0, 32, 91); // Dark blue color for the header
    doc.setFontSize(22); // Larger font size for the header
    doc.setFont("helvetica", "bold");
    doc.text('Ceylon Circuit', 14, 10); // Name of the organization
  
    // Title of the PDF
    doc.setTextColor(0, 32, 91);  // Dark blue for title
    doc.setFontSize(18);
    doc.text('Accommodation Report', 14, 18); // Title
  
    // Line for separation
    doc.setLineWidth(0.5);
    doc.line(14, 20, 200, 20); // Draw a line below the title
  
    let yPosition = 25; // Start position for the content, below the title
  
    accommodationsData.forEach((acc, index) => {
      if (yPosition > 250) {
        doc.addPage(); // Add a new page if the content overflows
        yPosition = 20; // Reset Y-position for the new page
      }
  
      // Draw the "card" background
      doc.setFillColor(255, 255, 255); // White background for the card
      doc.rect(14, yPosition, 180, 70, 'F'); // Card rectangle
      doc.setDrawColor(0, 0, 0); // Border color black
      doc.rect(14, yPosition, 180, 70); // Card border
  
      // Accommodation name (title of the card)
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 32, 91);  // Dark blue for title
      doc.text(acc.accName, 20, yPosition + 12);
  
      // Accommodation location and address
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);  // Black for text
      doc.setFontSize(10);
      doc.text(`Location: ${acc.location}`, 20, yPosition + 22);
      doc.text(`Address: ${acc.address}`, 20, yPosition + 32);
      doc.text(`Available Single Rooms: ${acc.availableSingleRooms}`, 20, yPosition + 42);
      doc.text(`Available Double Rooms: ${acc.availableDoubleRooms}`, 20, yPosition + 52);
      doc.text(`Facilities: ${acc.facilities}`, 20, yPosition + 62);
  
      // Add a separator line for each card (optional)
      doc.setLineWidth(0.5);
      doc.line(14, yPosition + 70, 200, yPosition + 70); // Line below the card content
  
      // Adjust Y-position for the next card
      yPosition += 80;
    });
  
    // Footer with date
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);  // Light gray for footer text
    doc.text('Report generated on: ' + new Date().toLocaleDateString(), 14, 290);
  
    // Save the generated PDF
    doc.save('accommodation_report.pdf');
  };
  
  const handleEditClick = (acc) => {
    localStorage.setItem("accommodation", JSON.stringify(acc));
    navigate(`/edit-accommodation`); // Navigate to the edit page with the accommodation ID
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

          

          {/* Loading Indicator */}
          {isPageLoaded ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress size={50} color="primary" />
            </Box>
          ) : (
            <Box sx={{ mt: 4 }}>
              {/* Button to generate PDF */}
              <Button
              variant="contained"
              color="primary"
              onClick={generatePDF}
              sx={{ mb: 3 }}
            >
              Generate PDF Report
            </Button>
              <Grid container spacing={2}>
                {accommodationsData.map((acc, index) => (
                  <Grid item xs={12} key={index}>
                    <Card sx={{ display: "flex", justifyContent: "space-between", p: 2, borderRadius: "12px", boxShadow: 3 }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight={600}>{acc.accName}</Typography>
                        <Typography variant="body2" color="textSecondary">Accommodation Name: {acc.accName}</Typography>
                        <Typography variant="body2" color="textSecondary">Location: {acc.location}</Typography>
                        <Typography variant="body2" color="textSecondary">Address: {acc.address}</Typography>
                        <Typography variant="body2" color="textSecondary">Available Single Rooms: {acc.availableSingleRooms}</Typography>
                        <Typography variant="body2" color="textSecondary">Available Double Rooms: {acc.availableDoubleRooms}</Typography>
                        <Typography variant="body2" color="textSecondary">Facilities: {acc.facilities}</Typography>

                      </CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", pr: 2 }}>
                        {/* Edit Icon */}
                        <IconButton color="primary"
                        onClick={() => handleEditClick(acc)}>
                          <EditIcon />
                        </IconButton>

                        {/* Delete Icon */}
                        <IconButton color="error" 
                        onClick={() => handleDeleteClick(acc._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
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
