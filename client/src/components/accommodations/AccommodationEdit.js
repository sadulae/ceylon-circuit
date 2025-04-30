import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Avatar, Button, TextField, Grid, Alert, InputAdornment, Fade } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { updateAccommodation } from '../../redux/slices/accSlice';
import SaveIcon from '@mui/icons-material/Save';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const AccommodationEdit = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [accommodation, setAccommodation] = useState(JSON.parse(localStorage.getItem("accommodation")));
  
  const [formData, setFormData] = useState({
    accName: accommodation?.accName || '',
    location: accommodation?.location || '',
    address: accommodation?.address || '',
    availableSingleRooms: accommodation?.availableSingleRooms || '',
    availableDoubleRooms: accommodation?.availableDoubleRooms || '',
    facilities: accommodation?.facilities || '',
  });

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Updating accommodation:', accommodation._id);
      console.log('With data:', formData);
      
      // Format data correctly according to the API expectations
      const accommodationData = {
        ...formData,
        // Convert to numbers if needed
        availableSingleRooms: formData.availableSingleRooms ? parseInt(formData.availableSingleRooms) : 0,
        availableDoubleRooms: formData.availableDoubleRooms ? parseInt(formData.availableDoubleRooms) : 0,
      };
      
      const result = await dispatch(
        updateAccommodation({
          id: accommodation._id,
          accommodationData: accommodationData, // Send correctly named parameter
        })
      ).unwrap();

      console.log('Update result:', result);

      setSuccess('Accommodation updated successfully');
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Accommodation updated successfully',
        confirmButtonColor: '#4FD1C5'
      });
      navigate(`/acc-updt`);
    } catch (err) {
      console.error('Error updating accommodation:', err);
      
      // Show detailed error information
      const errorMessage = err.message || 'Failed to update accommodation';
      setError(errorMessage);
      
      // Show error alert
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: errorMessage,
        confirmButtonColor: '#f44336'
      });
    }
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
      <Fade in={isPageLoaded} timeout={800}>
        <Container maxWidth="md">
          <Paper
            elevation={3}
            sx={{ p: 4, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Avatar sx={{ width: 120, height: 120, bgcolor: '#4FD1C5', fontSize: '1.8rem' }}>
                {accommodation.accName}
              </Avatar>
            </Box>

            {error && <Fade in={true}><Alert severity="error" sx={{ mb: 2 }}>{error}</Alert></Fade>}
            {success && <Fade in={true}><Alert severity="success" sx={{ mb: 2 }}>{success}</Alert></Fade>}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Accommodation Name"
                    name="accName"
                    value={formData.accName}
                    onChange={handleChange}
                    InputProps={{
                      sx: { '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#4FD1C5' } } }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"></InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"></InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Available Single Rooms"
                    name="availableSingleRooms"
                    value={formData.availableSingleRooms}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"></InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Available Double Rooms"
                    name="availableDoubleRooms"
                    value={formData.availableDoubleRooms}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"></InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Facilities"
                    name="facilities"
                    value={formData.facilities}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"></InputAdornment>
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  sx={{ bgcolor: '#4FD1C5', color: 'white', px: 4, py: 1.5, '&:hover': { bgcolor: '#38A89D' } }}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Fade>
    </Box>
  );
};

export default AccommodationEdit;
