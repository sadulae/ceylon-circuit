import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Alert,
  Divider
} from '@mui/material';

const CreateDestination = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: {
      city: '',
      country: '',
      continent: '',
      coordinates: [0, 0],
      timeZone: ''
    },
    images: [{ url: '', caption: '', isFeatured: false }],
    categories: [],
    tags: [],
    bestTimeToVisit: [],
    weather: {
      averageTemp: 0,
      rainySeason: [],
      bestSeason: ''
    },
    languages: []
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const continents = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Antarctica'];
  const categoryOptions = ['Beach', 'Mountain', 'City', 'Historical', 'Adventure', 'Wildlife', 'Religious', 'Luxury'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const handleImageChange = (index, field, value) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages[index] = { ...newImages[index], [field]: value };
      return { ...prev, images: newImages };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5010/api/destinations',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSuccess('Destination created successfully!');
      navigate(`/destinations/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create destination');
      console.error('Creation error:', err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Destination
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { mb: 2 } }}>
        {/* Basic Information */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name*"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description*"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Location Details */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Location Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City*"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country*"
                name="location.country"
                value={formData.location.country}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Continent</InputLabel>
                <Select
                  label="Continent"
                  name="location.continent"
                  value={formData.location.continent}
                  onChange={handleChange}
                >
                  {continents.map(continent => (
                    <MenuItem key={continent} value={continent}>{continent}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Coordinates
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="number"
                    value={formData.location.coordinates[0]}
                    onChange={(e) => {
                      const newCoords = [...formData.location.coordinates];
                      newCoords[0] = parseFloat(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        location: { ...prev.location, coordinates: newCoords }
                      }));
                    }}
                    inputProps={{ step: "0.000001" }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    type="number"
                    value={formData.location.coordinates[1]}
                    onChange={(e) => {
                      const newCoords = [...formData.location.coordinates];
                      newCoords[1] = parseFloat(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        location: { ...prev.location, coordinates: newCoords }
                      }));
                    }}
                    inputProps={{ step: "0.000001" }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        {/* Images */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Images
          </Typography>
          {formData.images.map((image, index) => (
            <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Image URL"
                    type="url"
                    value={image.url}
                    onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Caption"
                    value={image.caption}
                    onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={image.isFeatured}
                        onChange={(e) => handleImageChange(index, 'isFeatured', e.target.checked)}
                      />
                    }
                    label="Featured Image"
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button
            variant="contained"
            onClick={() => setFormData(prev => ({
              ...prev,
              images: [...prev.images, { url: '', caption: '', isFeatured: false }]
            }))}
          >
            Add Another Image
          </Button>
        </Paper>

        {/* Categories */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Categories
          </Typography>
          <FormGroup row>
            {categoryOptions.map(category => (
              <FormControlLabel
                key={category}
                control={
                  <Checkbox
                    checked={formData.categories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          categories: [...prev.categories, category]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          categories: prev.categories.filter(c => c !== category)
                        }));
                      }
                    }}
                  />
                }
                label={category}
              />
            ))}
          </FormGroup>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="success"
            size="large"
          >
            Create Destination
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CreateDestination;