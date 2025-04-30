import React, { useState } from 'react';
import Swal from "sweetalert2";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createAccommodation } from '../../redux/slices/accSlice';
import BadgeIcon from '@mui/icons-material/Badge';

const districts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota",
  "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale",
  "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee",
  "Vavuniya"
];

const facilityOptions = [
  "WiFi", "Parking", "Swimming Pool", "Gym", "Laundry Service", "24/7 Security"
];

const Accommodation = () => {
  const [formData, setFormData] = useState({
    accName: '',
    location: '',
    address: '',
    availableSingleRooms: '',
    availableDoubleRooms: '',
    facilities: []
  });
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleFacilitiesChange = (event) => {
    setFormData({
      ...formData,
      facilities: event.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { accName, location, address, availableSingleRooms, availableDoubleRooms, facilities } = formData;
    
    // Form validation
    if (!accName || !location || !address) {
      setError('Accommodation name, location, and address are required');
      return;
    }
    
    if (!availableSingleRooms && !availableDoubleRooms) {
      setError('You must specify at least one room type');
      return;
    }

    // Convert to numbers and compute total
    const singleRooms = Number(availableSingleRooms) || 0;
    const doubleRooms = Number(availableDoubleRooms) || 0;
    const totalRooms = singleRooms + doubleRooms;
    
    try {
      console.log('Submitting accommodation data:', {
        accName, 
        location, 
        address, 
        availableSingleRooms: singleRooms, 
        availableDoubleRooms: doubleRooms, 
        availableRooms: totalRooms,
        facilities
      });
      
      const res = await dispatch(createAccommodation({
        accName, 
        location, 
        address, 
        availableSingleRooms: singleRooms, 
        availableDoubleRooms: doubleRooms, 
        availableRooms: totalRooms,
        facilities
      })).unwrap();
      
      console.log("Response from createAccommodation:", res);
      
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Accommodation added successfully!",
        confirmButtonColor: "#3085d6",
      });
      
      // Reset form
      setFormData({
        accName: '',
        location: '',
        address: '',
        availableSingleRooms: '',
        availableDoubleRooms: '',
        facilities: []
      });
      
    } catch (err) {
      console.error("Error in createAccommodation:", err);
      
      if (err && err.includes("already exists")) {
        Swal.fire({
          icon: "error",
          title: "Duplicate Entry",
          text: "Accommodation already exists with this name!",
          confirmButtonColor: "#d33",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err || "Failed to add accommodation. Please try again.",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0E374E 0%, #4FD1C5 100%)',
        pt: 8
      }}
    >
      <Container maxWidth="sm">
      <button 
  type="button" 
  className="btn btn-secondary"
  style={{
    marginRight: "auto", 
    display: "block",
    borderRadius: "10px", // Rounded corners
    padding: "12px 24px", // Adjust height & width
    fontSize: "16px"      // Slightly larger text
  }}
  onClick={() => navigate("/acc-updt")}
>
  Accommodation List
</button>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            gutterBottom
            sx={{ color: '#0E374E', fontWeight: 600, mb: 3 }}
          >
            Accommodation Details
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="accName"
                  label="Accommodation Name"
                  name="accName"
                  value={formData.accName}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon sx={{ color: '#4FD1C5' }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Location</InputLabel>
                  <Select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  >
                    {districts.map((district) => (
                      <MenuItem key={district} value={district}>
                        {district}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="address"
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  required
                  fullWidth
                  id="availableSingleRooms"
                  label="Available Single Rooms"
                  name="availableSingleRooms"
                  type="number"
                  value={formData.availableSingleRooms}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  required
                  fullWidth
                  id="availableDoubleRooms"
                  label="Available Double Rooms"
                  name="availableDoubleRooms"
                  type="number"
                  value={formData.availableDoubleRooms}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Facilities</InputLabel>
                  <Select
                    multiple
                    name="facilities"
                    value={formData.facilities}
                    onChange={handleFacilitiesChange}
                    input={<OutlinedInput label="Facilities" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
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
            </Grid>
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, bgcolor: '#4FD1C5', color: 'white' }} disabled={loading}>{loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}</Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Accommodation;
