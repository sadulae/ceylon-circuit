import React, { useState } from 'react';
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
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
  IconButton,
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
import { addAccommodation } from '../../redux/slices/accSlice';
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
    const availableRooms = Number(availableSingleRooms) + Number(availableDoubleRooms);

    if (!accName || !location || !address || !availableSingleRooms || !availableDoubleRooms || facilities.length === 0) {
      setError('All fields are required');
      return;
    }

    try {
      const res = await dispatch(addAccommodation({ accName, location, address, availableSingleRooms, availableDoubleRooms, availableRooms, facilities })).unwrap();
      console.log("res",res)
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Accommodation added successfully!",
        confirmButtonColor: "#3085d6",
      });
      // navigate('/login');
    } catch (err) {
      console.log("err",err)
      if (err.status === 400) {
        Swal.fire({
          icon: "error",
          title: "Duplicate Entry",
          text: "Accommodation already exists!",
          confirmButtonColor: "#d33",
        });
      } else {
        // setError(err.message || "Registration failed. Please try again.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Registration failed. Please try again.",
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
