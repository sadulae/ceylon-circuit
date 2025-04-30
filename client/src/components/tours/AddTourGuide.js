import { useState } from 'react';
import { 
    Button, 
    TextField, 
    Grid, 
    Box, 
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Stack,
    Alert,
    Checkbox,
    ListItemText,
    OutlinedInput
} from '@mui/material';
import { 
    CloudUpload as CloudUploadIcon, 
    PersonAdd as PersonAddIcon,
    ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { createGuide } from './tourapi';
import { useNavigate } from 'react-router-dom';

// Sri Lanka districts
const DISTRICTS = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Mullaitivu', 'Vavuniya', 'Puttalam', 'Kurunegala', 'Anuradhapura',
    'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle', 'Trincomalee',
    'Batticaloa', 'Ampara'
];

// Predefined list of languages
const LANGUAGES = [
    // Major Sri Lankan languages
    'Sinhala', 'Tamil', 'English',
    
    // Major European languages
    'German', 'French', 'Italian', 'Spanish', 'Portuguese', 'Dutch', 
    'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Greek', 'Russian', 'Polish',
    
    // Major Asian languages
    'Chinese (Mandarin)', 'Chinese (Cantonese)', 'Japanese', 'Korean', 
    'Hindi', 'Urdu', 'Bengali', 'Thai', 'Malay', 'Indonesian', 'Vietnamese',
    
    // Middle Eastern languages
    'Arabic', 'Hebrew', 'Turkish', 'Persian (Farsi)',
    
    // Other major languages
    'Swahili', 'Portuguese'
];

// Predefined list of specializations
const SPECIALIZATIONS = [
    // Nature & Wildlife
    'Wildlife Safari', 'Birdwatching', 'Whale Watching', 'Nature Trails', 'Eco Tourism',
    
    // Cultural & Heritage
    'Cultural Heritage', 'Ancient Cities', 'Temple Tours', 'Colonial History',
    'Buddhist Heritage', 'Hindu Heritage', 'Muslim Heritage', 'Christian Heritage',
    
    // Adventure & Activities
    'Adventure Tours', 'Trekking', 'Hiking', 'Camping', 'Water Sports',
    'Surfing', 'Diving', 'Snorkeling', 'White Water Rafting', 'Rock Climbing',
    
    // Special Interest
    'Photography Tours', 'Culinary Tours', 'Tea Plantation Tours', 'Spice Garden Tours', 
    'Gem Mining Tours', 'Ayurveda & Wellness', 'Yoga Retreats',
    
    // Geographic Specialties
    'Hill Country Tours', 'Beach Tours', 'Coastal Tours', 'National Parks',
    'Countryside Tours', 'Village Tours', 'City Tours',
    
    // Festival & Events
    'Festival Tours', 'Perahera Tours', 'Cultural Events',
    
    // Practical Specialties
    'Family Tours', 'Honeymoon Tours', 'Budget Tours', 'Luxury Tours',
    'Educational Tours', 'School Trips', 'Senior Tours'
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const AddTourGuide = ({ onGuideAdded }) => {
    const navigate = useNavigate();
    const [guide, setGuide] = useState({ 
        name: '', 
        email: '', 
        phone: '',
        district: '',
        languages: [], 
        specializations: [],
        experience: '', 
        description: '', 
        rating: 3.0,
        image: null 
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        
        try {
        const formData = new FormData();
            formData.append('name', guide.name);
            formData.append('email', guide.email);
            formData.append('phone', guide.phone || '');
            formData.append('district', guide.district);
            
            // Convert selected languages to JSON array
            formData.append('languages', JSON.stringify(guide.languages));
            
            // Convert selected specializations to JSON array
            formData.append('specializations', JSON.stringify(guide.specializations));
            
            formData.append('experience', guide.experience);
            formData.append('bio', guide.description);
            formData.append('rating', guide.rating.toString());
            if (guide.image) formData.append('image', guide.image);

        await createGuide(formData);
            setSuccess(true);
            
            // Reset form
            setGuide({ 
                name: '', 
                email: '', 
                phone: '',
                district: '',
                languages: [], 
                specializations: [],
                experience: '', 
                description: '',
                rating: 3.0,
                image: null 
            });
            setPreviewImage(null);
            
            // Call callback
            if (onGuideAdded) onGuideAdded();
        } catch (err) {
            console.error('Error adding guide:', err);
            setError(err.message || 'Failed to add guide. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setGuide({ ...guide, image: file });
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle multiple select change
    const handleMultiSelectChange = (event, field) => {
        const {
            target: { value },
        } = event;
        
        setGuide({
            ...guide,
            [field]: typeof value === 'string' ? value.split(',') : value,
        });
    };

    const handleBack = () => {
        navigate('/admin/tours');
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={handleBack}
                    variant="outlined"
                    sx={{ mr: 2 }}
                >
                    Back to Tours
                </Button>
                <Typography variant="h5" component="h1">Add Tour Guide</Typography>
            </Box>
            
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            
            {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
                    Tour guide added successfully!
                </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    label="Full Name" 
                                    value={guide.name} 
                                    onChange={(e) => setGuide({ ...guide, name: e.target.value })} 
                                    fullWidth 
                                    required 
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    label="Email Address" 
                                    type="email" 
                                    value={guide.email} 
                                    onChange={(e) => setGuide({ ...guide, email: e.target.value })} 
                                    fullWidth 
                                    required 
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    label="Phone Number" 
                                    value={guide.phone} 
                                    onChange={(e) => setGuide({ ...guide, phone: e.target.value })} 
                                    fullWidth 
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required variant="outlined">
                                    <InputLabel>District</InputLabel>
                                    <Select
                                        value={guide.district}
                                        label="District"
                                        onChange={(e) => setGuide({ ...guide, district: e.target.value })}
                                    >
                                        {DISTRICTS.map(district => (
                                            <MenuItem key={district} value={district}>
                                                {district}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    label="Experience (years)" 
                                    type="number" 
                                    value={guide.experience} 
                                    onChange={(e) => setGuide({ ...guide, experience: e.target.value })} 
                                    fullWidth 
                                    required 
                                    variant="outlined"
                                    inputProps={{ min: 0 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    label="Rating" 
                                    type="number" 
                                    value={guide.rating} 
                                    onChange={(e) => setGuide({ ...guide, rating: parseFloat(e.target.value) || 0 })} 
                                    fullWidth 
                                    required 
                                    variant="outlined"
                                    inputProps={{ min: 1, max: 5, step: 0.1 }}
                                    helperText="Rating from 1.0 to 5.0"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel id="languages-label">Languages</InputLabel>
                                    <Select
                                        labelId="languages-label"
                                        multiple
                                        value={guide.languages}
                                        onChange={(e) => handleMultiSelectChange(e, 'languages')}
                                        input={<OutlinedInput label="Languages" />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value} color="primary" variant="outlined" size="small" />
                                                ))}
                                            </Box>
                                        )}
                                        MenuProps={MenuProps}
                                    >
                                        {LANGUAGES.map((language) => (
                                            <MenuItem key={language} value={language}>
                                                <Checkbox checked={guide.languages.indexOf(language) > -1} />
                                                <ListItemText primary={language} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel id="specializations-label">Specializations</InputLabel>
                                    <Select
                                        labelId="specializations-label"
                                        multiple
                                        value={guide.specializations}
                                        onChange={(e) => handleMultiSelectChange(e, 'specializations')}
                                        input={<OutlinedInput label="Specializations" />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value} color="secondary" variant="outlined" size="small" />
                                                ))}
                                            </Box>
                                        )}
                                        MenuProps={MenuProps}
                                    >
                                        {SPECIALIZATIONS.map((specialization) => (
                                            <MenuItem key={specialization} value={specialization}>
                                                <Checkbox checked={guide.specializations.indexOf(specialization) > -1} />
                                                <ListItemText primary={specialization} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    label="Bio / Description" 
                                    multiline 
                                    rows={4} 
                                    value={guide.description} 
                                    onChange={(e) => setGuide({ ...guide, description: e.target.value })} 
                                    fullWidth 
                                    required 
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                        <Paper 
                            elevation={0} 
                            variant="outlined" 
                            sx={{ 
                                p: 3, 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center',
                                height: '100%',
                                borderRadius: 2
                            }}
                        >
                            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                                Guide Photo
                            </Typography>
                            
                            <Box 
                                sx={{ 
                                    width: '100%', 
                                    height: 200, 
                                    mb: 2,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    bgcolor: 'grey.100',
                                    borderRadius: 1,
                                    overflow: 'hidden'
                                }}
                            >
                                {previewImage ? (
                                    <Box 
                                        component="img" 
                                        src={previewImage}
                                        alt="Guide preview"
                                        sx={{ 
                                            maxWidth: '100%', 
                                            maxHeight: '100%',
                                            objectFit: 'contain'
                                        }}
                                    />
                                ) : (
                                    <Typography color="text.secondary" align="center">
                                        No image selected
                                    </Typography>
                                )}
                            </Box>
                            
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUploadIcon />}
                                sx={{ mb: 2 }}
                                fullWidth
                            >
                                Upload Photo
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    required
                                />
                            </Button>
                            
                            <Typography variant="caption" color="text.secondary" align="center">
                                {guide.image ? `Selected: ${guide.image.name}` : 'Please select an image file (JPG, PNG)'}
                            </Typography>
                        </Paper>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="primary" 
                                size="large"
                                disabled={loading}
                                startIcon={<PersonAddIcon />}
                                sx={{ borderRadius: 2 }}
                            >
                                {loading ? 'Adding Guide...' : 'Add Tour Guide'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
        </form>
        </Box>
    );
};

export default AddTourGuide;
