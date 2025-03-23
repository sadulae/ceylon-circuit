import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, useTheme } from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from 'react-router-dom';

// Import local images
import sigiriyaImg from '../../assets/images/sigiriya.jpg';
import beachImg from '../../assets/images/beach.jpg';
import teaImg from '../../assets/images/tea-plantation.jpg';
import templeImg from '../../assets/images/temple.jpg';
import safariImg from '../../assets/images/safari.jpg';

// Array of hero images
const heroImages = [
  {
    url: sigiriyaImg,
    title: 'Sigiriya Rock Fortress',
    description: 'Discover the ancient wonders of Sri Lanka'
  },
  {
    url: beachImg,
    title: 'Beautiful Beaches',
    description: 'Explore pristine coastal paradises'
  },
  {
    url: teaImg,
    title: 'Tea Plantations',
    description: 'Experience the world-famous Ceylon Tea estates'
  },
  {
    url: templeImg,
    title: 'Temple of the Sacred Tooth Relic',
    description: 'Visit ancient Buddhist temples and cultural sites'
  },
  {
    url: safariImg,
    title: 'Wildlife Safari',
    description: 'Encounter exotic wildlife in their natural habitat'
  }
];

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box 
        sx={{
          position: 'relative',
          height: '80vh', // Reduced from 100vh to 80vh
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3))',
            zIndex: 1
          }
        }}
      >
        {/* Hero Images */}
        {heroImages.map((image, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: currentImageIndex === index ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              '& img': {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }
            }}
          >
            <img src={image.url} alt={image.title} />
          </Box>
        ))}

        {/* Hero Content */}
        <Container 
          maxWidth="lg" 
          sx={{
            position: 'relative',
            height: '100%',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            pt: 8, // Add padding top to account for navbar
          }}
        >
          <Box sx={{ maxWidth: '600px' }}>
            <Typography
              variant="h2"
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: 2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {heroImages[currentImageIndex].title}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'white',
                mb: 4,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {heroImages[currentImageIndex].description}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<ExploreIcon />}
              onClick={() => navigate('/plan')}
              sx={{
                backgroundColor: '#4FD1C5',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#38A89D',
                },
                px: 4,
                py: 1.5,
                fontFamily: "'Poppins', sans-serif",
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 500,
                borderRadius: '8px',
                boxShadow: '0 4px 14px rgba(79, 209, 197, 0.4)',
              }}
            >
              Start Planning Your Journey
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: '#F7FAFC' }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            align="center" 
            gutterBottom
            sx={{
              color: '#0E374E',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              mb: 4
            }}
          >
            Why Choose Ceylon Circuit?
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(14, 55, 78, 0.1)',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 30px rgba(14, 55, 78, 0.2)',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 40, color: '#4FD1C5' }} />
                  </Box>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    align="center" 
                    gutterBottom
                    sx={{
                      color: '#0E374E',
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600
                    }}
                  >
                    AI-Powered Planning
                  </Typography>
                  <Typography 
                    variant="body1" 
                    align="center"
                    sx={{
                      color: '#4A5568',
                      fontFamily: "'Poppins', sans-serif"
                    }}
                  >
                    Our smart TripBot creates personalized itineraries based on your preferences and interests.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(14, 55, 78, 0.1)',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 30px rgba(14, 55, 78, 0.2)',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <LocationOnIcon sx={{ fontSize: 40, color: '#4FD1C5' }} />
                  </Box>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    align="center" 
                    gutterBottom
                    sx={{
                      color: '#0E374E',
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600
                    }}
                  >
                    Local Expertise
                  </Typography>
                  <Typography 
                    variant="body1" 
                    align="center"
                    sx={{
                      color: '#4A5568',
                      fontFamily: "'Poppins', sans-serif"
                    }}
                  >
                    Get insights from local experts and discover hidden gems across Sri Lanka.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(14, 55, 78, 0.1)',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 30px rgba(14, 55, 78, 0.2)',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <ExploreIcon sx={{ fontSize: 40, color: '#4FD1C5' }} />
                  </Box>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    align="center" 
                    gutterBottom
                    sx={{
                      color: '#0E374E',
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600
                    }}
                  >
                    Customizable Tours
                  </Typography>
                  <Typography 
                    variant="body1" 
                    align="center"
                    sx={{
                      color: '#4A5568',
                      fontFamily: "'Poppins', sans-serif"
                    }}
                  >
                    Tailor your journey with flexible itineraries and personalized experiences.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 