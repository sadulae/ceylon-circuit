import React from 'react';
import { Box, Typography, Button, Container, Paper, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import GuideForm from './AddTourGuide';
import GuideList from './TourGuideList';

const AdminGuides = () => {
    const navigate = useNavigate();
    
    return (
        <Container 
            maxWidth="xl" 
            sx={{ 
                mt: { xs: 10, sm: 12 }, 
                mb: 4, 
                pt: 3,
                px: { xs: 2, sm: 3, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            <Typography 
                variant="h4" 
                component="h1" 
                fontWeight="bold" 
                color="primary" 
                gutterBottom
                sx={{ mb: 4, textAlign: 'center' }}
            >
                Tour Guide Management
            </Typography>
            
            <Paper 
                sx={{ 
                    p: 0, 
                    width: '100%', 
                    maxWidth: 1400,
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: 3,
                    mb: 4
                }}
            >
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    p: 3,
                    bgcolor: 'primary.main',
                    color: 'white'
                }}>
                    <Typography variant="h5" fontWeight="medium">Add New Tour Guide</Typography>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        onClick={() => navigate('/admin/tours')}
                        startIcon={<ArrowBack />}
                        sx={{ borderRadius: 2 }}
                    >
                        Back to Tour Management
                    </Button>
                </Box>
                <Box sx={{ p: 3 }}>
                    <GuideForm onGuideAdded={() => window.location.reload()} />
                </Box>
            </Paper>
            
            <Paper 
                sx={{ 
                    p: 0, 
                    width: '100%', 
                    maxWidth: 1400,
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: 3
                }}
            >
                <Box sx={{ 
                    p: 3,
                    bgcolor: 'primary.main',
                    color: 'white'
                }}>
                    <Typography variant="h5" fontWeight="medium">Tour Guide List</Typography>
                </Box>
                <Box sx={{ p: 0 }}>
                    <GuideList />
                </Box>
            </Paper>
        </Container>
    );
};

export default AdminGuides;
