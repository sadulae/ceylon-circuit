import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, useTheme } from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
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
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const tripBotSectionRef = useRef(null);
  const [isTripBotVisible, setIsTripBotVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsTripBotVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.3,
      }
    );

    if (tripBotSectionRef.current) {
      observer.observe(tripBotSectionRef.current);
    }

    return () => {
      if (tripBotSectionRef.current) {
        observer.unobserve(tripBotSectionRef.current);
      }
    };
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

      {/* TripBot Section with Sri Lankan themed animated background */}
      <Box 
        ref={tripBotSectionRef}
        sx={{
          position: 'relative',
          py: 10,
          overflow: 'hidden',
          backgroundImage: 'linear-gradient(to right, rgba(14, 55, 78, 0.9), rgba(79, 209, 197, 0.8))',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1578758837674-93ed0ab5fbab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2,
            zIndex: -1,
          },
          '@keyframes floatElements': {
            '0%': {
              transform: 'translateY(30px)',
              opacity: 0,
            },
            '100%': {
              transform: 'translateY(0)',
              opacity: 1,
            }
          },
          '@keyframes waveAnimation': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' }
          },
          '@keyframes shine': {
            '0%': { backgroundPosition: '-100% 0' },
            '100%': { backgroundPosition: '200% 0' }
          }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{
                animation: isTripBotVisible 
                  ? 'floatElements 0.8s ease-out forwards'
                  : 'none',
                opacity: 0,
              }}>
                <Typography 
                  variant="h2" 
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    mb: 3,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    fontFamily: "'Poppins', sans-serif",
                    position: 'relative',
                    display: 'inline-block',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -10,
                      left: 0,
                      width: '80px',
                      height: '4px',
                      background: 'linear-gradient(90deg, #fff, #4FD1C5, #fff)',
                      backgroundSize: '200% 100%',
                      animation: 'waveAnimation 2s infinite',
                    }
                  }}
                >
                  Meet Our TripBot
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{
                    color: 'white',
                    mb: 3,
                    fontFamily: "'Poppins', sans-serif",
                    animation: isTripBotVisible 
                      ? 'floatElements 0.8s ease-out 0.2s forwards'
                      : 'none',
                    opacity: 0,
                  }}
                >
                  Your AI-powered travel companion for exploring the beauty of Sri Lanka
                </Typography>
                <Box sx={{
                  animation: isTripBotVisible 
                    ? 'floatElements 0.8s ease-out 0.4s forwards'
                    : 'none',
                  opacity: 0,
                }}>
                  <Typography 
                    variant="body1" 
                    sx={{
                      color: 'white',
                      mb: 4,
                      fontSize: '1.1rem',
                      lineHeight: 1.6,
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    Our TripBot combines cutting-edge AI with local expertise to create the perfect Sri Lankan adventure for you. Whether you're interested in ancient temples, pristine beaches, lush tea plantations, or wildlife safaris, our TripBot will craft a personalized itinerary that matches your interests, budget, and travel style.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ChatIcon />}
                    onClick={() => navigate('/tripbot')}
                    sx={{
                      backgroundColor: 'white',
                      color: '#0E374E',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                      },
                      px: 4,
                      py: 1.5,
                      fontFamily: "'Poppins', sans-serif",
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      borderRadius: '8px',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Chat with TripBot
                  </Button>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{
                position: 'relative',
                height: 400,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                animation: isTripBotVisible 
                  ? 'floatElements 0.8s ease-out 0.6s forwards'
                  : 'none',
                opacity: 0,
              }}>
                <Box
                  sx={{
                    position: 'relative',
                    width: '80%',
                    height: '80%',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(14, 55, 78, 0.7)',
                      backdropFilter: 'blur(4px)',
                      zIndex: 1,
                    },
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.05)' },
                      '100%': { transform: 'scale(1)' }
                    },
                    animation: isTripBotVisible ? 'pulse 4s infinite ease-in-out' : 'none'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: 'url("https://images.unsplash.com/photo-1546975490-e8b92a360b24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      zIndex: 0,
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 2,
                      textAlign: 'center',
                      width: '100%',
                      px: 4,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 2,
                        '@keyframes robotFloat': {
                          '0%': { transform: 'translateY(0)' },
                          '50%': { transform: 'translateY(-10px)' },
                          '100%': { transform: 'translateY(0)' }
                        },
                        animation: isTripBotVisible ? 'robotFloat 3s infinite ease-in-out' : 'none'
                      }}
                    >
                      <SmartToyIcon
                        sx={{
                          fontSize: 80,
                          color: '#4FD1C5',
                          filter: 'drop-shadow(0 0 10px rgba(79, 209, 197, 0.7))',
                        }}
                      />
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        color: 'white',
                        fontWeight: 600,
                        mb: 2,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        fontFamily: "'Poppins', sans-serif",
                        background: 'linear-gradient(90deg, #4FD1C5, #fff, #4FD1C5)',
                        backgroundSize: '200% 100%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: 'shine 3s infinite linear',
                      }}
                    >
                      Ceylon TripBot
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'white',
                        mb: 3,
                        opacity: 0.9,
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      "Ayubowan! I'm here to help you discover the wonders of Sri Lanka."
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 