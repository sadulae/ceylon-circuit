import { useEffect, useState } from 'react';
import { fetchGuides, deleteGuide, updateGuide } from './tourapi';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Button, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogTitle, 
    TextField,
    Box,
    IconButton,
    Chip,
    Typography,
    Grid,
    CircularProgress,
    Alert
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon,
    CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';

const TourGuideList = () => {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
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
    const [previewImage, setPreviewImage] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    const loadGuides = async () => {
        setLoading(true);
        try {
        const response = await fetchGuides();
            if (response && response.data) {
        setGuides(response.data);
            } else {
                setError('Failed to load guides');
            }
        } catch (err) {
            console.error('Error loading guides:', err);
            setError('Failed to load guides. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGuides();
    }, []);
    
    const handleDelete = async (id, name) => {
        Swal.fire({
            title: 'Delete Guide',
            text: `Are you sure you want to delete ${name}? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
        await deleteGuide(id);
                    await loadGuides();
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

    const handleOpenUpdateModal = (guide) => {
        setSelectedGuide(guide);
        setUpdatedGuide({
            name: guide.name,
            email: guide.email,
            phone: guide.phone || '',
            languages: guide.languages ? guide.languages.join(', ') : '',
            experience: guide.experience,
            description: guide.bio || guide.description || '',
            image: null
        });
        
        // Set preview image if available
        if (guide.image) {
            setPreviewImage(`http://localhost:5000/uploads/${guide.image}`);
        } else {
            setPreviewImage(null);
        }
        
        setOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUpdatedGuide({ ...updatedGuide, image: file });
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedGuide(null);
        setPreviewImage(null);
    };

    const handleUpdate = async () => {
        if (!selectedGuide) return;
        
        setUpdateLoading(true);
        try {
        const formData = new FormData();
        formData.append('name', updatedGuide.name);
        formData.append('email', updatedGuide.email);
            formData.append('phone', updatedGuide.phone || '');
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
            
        handleClose();
            await loadGuides();
        } catch (err) {
            console.error('Error updating guide:', err);
            Swal.fire({
                title: 'Error',
                text: err.message || 'Failed to update tour guide',
                icon: 'error',
                confirmButtonColor: '#d33'
            });
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                {error}
            </Alert>
        );
    }

    if (guides.length === 0) {
        return (
            <Alert severity="info" sx={{ m: 2 }}>
                No tour guides found. Add your first tour guide using the form above.
            </Alert>
        );
    }

    return (
        <>
            <TableContainer component={Paper}>
                <Table size="medium">
                    <TableHead sx={{ bgcolor: 'primary.main' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Guide</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Languages</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Experience</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {guides.map((guide) => (
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
                                        <Typography variant="subtitle1" fontWeight="medium">
                                            {guide.name}
                                        </Typography>
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
                                <TableCell>
                                    <Typography variant="body2" sx={{ 
                                        maxWidth: 250,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        {guide.bio || guide.description || 'No description available'}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton 
                                        color="primary" 
                                        onClick={() => handleOpenUpdateModal(guide)}
                                        title="Edit Guide"
                                        sx={{ mx: 0.5 }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        color="error" 
                                        onClick={() => handleDelete(guide._id, guide.name)}
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

            {/* Update Modal */}
            <Dialog 
                open={open} 
                onClose={handleClose}
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
                        <Grid item xs={12} md={8}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField 
                                        label="Full Name" 
                                        value={updatedGuide.name} 
                                        onChange={(e) => setUpdatedGuide({ ...updatedGuide, name: e.target.value })} 
                                        fullWidth 
                                        required 
                                        variant="outlined"
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField 
                                        label="Email Address" 
                                        type="email" 
                                        value={updatedGuide.email} 
                                        onChange={(e) => setUpdatedGuide({ ...updatedGuide, email: e.target.value })} 
                                        fullWidth 
                                        required 
                                        variant="outlined"
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField 
                                        label="Phone Number" 
                                        value={updatedGuide.phone} 
                                        onChange={(e) => setUpdatedGuide({ ...updatedGuide, phone: e.target.value })} 
                                        fullWidth 
                                        variant="outlined"
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField 
                                        label="Experience (years)" 
                                        type="number" 
                                        value={updatedGuide.experience} 
                                        onChange={(e) => setUpdatedGuide({ ...updatedGuide, experience: e.target.value })} 
                                        fullWidth 
                                        required 
                                        variant="outlined"
                                        margin="normal"
                                        inputProps={{ min: 0 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField 
                                        label="Languages (comma separated)" 
                                        value={updatedGuide.languages} 
                                        onChange={(e) => setUpdatedGuide({ ...updatedGuide, languages: e.target.value })} 
                                        fullWidth 
                                        required 
                                        variant="outlined"
                                        margin="normal"
                                        helperText="Enter languages separated by commas, e.g., English, Sinhala, Tamil"
                                    />
                                    
                                    {updatedGuide.languages && (
                                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {updatedGuide.languages.split(',').map((lang, index) => {
                                                const trimmedLang = lang.trim();
                                                if (!trimmedLang) return null;
                                                return (
                                                    <Chip 
                                                        key={index} 
                                                        label={trimmedLang} 
                                                        color="primary" 
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                );
                                            })}
                                        </Box>
                                    )}
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField 
                                        label="Bio / Description" 
                                        multiline 
                                        rows={4} 
                                        value={updatedGuide.description} 
                                        onChange={(e) => setUpdatedGuide({ ...updatedGuide, description: e.target.value })} 
                                        fullWidth 
                                        required 
                                        variant="outlined"
                                        margin="normal"
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2 }}>
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
                                    />
                                </Button>
                                
                                <Typography variant="caption" color="text.secondary" align="center">
                                    {updatedGuide.image ? `Selected: ${updatedGuide.image.name}` : 'Choose a new image (optional)'}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button 
                        onClick={handleClose}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleUpdate}
                        variant="contained" 
                        color="primary"
                        disabled={updateLoading}
                        sx={{ borderRadius: 2 }}
                    >
                        {updateLoading ? 'Updating...' : 'Update Guide'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default TourGuideList;
