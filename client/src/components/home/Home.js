import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, useTheme, Avatar } from '@mui/material';
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
          backgroundImage: 'linear-gradient(135deg, #121212 0%, #1E2937 100%)',
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
            opacity: 0.15,
            zIndex: -1,
            filter: 'grayscale(30%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 90% 20%, rgba(79, 209, 197, 0.15) 0%, transparent 50%)',
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
          },
          '@keyframes floatingDots': {
            '0%': { opacity: 0.2 },
            '50%': { opacity: 0.8 },
            '100%': { opacity: 0.2 }
          }
        }}
      >
        {/* Floating particles */}
        <Box sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          overflow: 'hidden',
          zIndex: 0,
        }}>
          {[...Array(20)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: '#4FD1C5',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `floatingDots ${Math.random() * 3 + 2}s infinite`,
                opacity: Math.random() * 0.5 + 0.2,
                boxShadow: '0 0 6px #4FD1C5',
              }}
            />
          ))}
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            {/* Left side - Text content */}
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
                    color: '#fff',
                    fontWeight: 700,
                    mb: 3,
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
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
                      background: 'linear-gradient(90deg, #4FD1C5, #63B3ED, #4FD1C5)',
                      backgroundSize: '200% 100%',
                      animation: 'waveAnimation 2s infinite',
                      borderRadius: '2px',
                    }
                  }}
                >
                  Meet Our TripBot
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{
                    color: '#B2F5EA',
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
                      color: '#E2E8F0',
                      mb: 4,
                      fontSize: '1.1rem',
                      lineHeight: 1.6,
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    Our TripBot combines cutting-edge AI with local expertise to create the perfect Sri Lankan adventure for you. Whether you're interested in ancient temples, pristine beaches, lush tea plantations, or wildlife safaris, our TripBot will craft a personalized itinerary that matches your interests, budget, and travel style.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                    {[
                      { icon: '🏛️', label: 'Cultural Sites' },
                      { icon: '🏖️', label: 'Beaches' },
                      { icon: '🌿', label: 'Tea Plantations' },
                      { icon: '🐘', label: 'Wildlife' },
                      { icon: '🍛', label: 'Cuisine' },
                      { icon: '🧘', label: 'Wellness' }
                    ].map((item) => (
                      <Box key={item.label} sx={{
                        backgroundColor: 'rgba(79, 209, 197, 0.1)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(79, 209, 197, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(79, 209, 197, 0.2)',
                          transform: 'translateY(-2px)',
                        }
                      }}>
                        <Typography sx={{ fontSize: '16px' }}>{item.icon}</Typography>
                        <Typography sx={{ 
                          color: '#E2E8F0',
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '0.9rem',
                          fontWeight: 500,
                        }}>
                          {item.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ChatIcon />}
                    onClick={() => navigate('/tripbot')}
                    sx={{
                      backgroundImage: 'linear-gradient(90deg, #4FD1C5, #63B3ED)',
                      color: '#0E374E',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundImage: 'linear-gradient(90deg, #38A89D, #4299E1)',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 20px rgba(79, 209, 197, 0.3)',
                      },
                      px: 4,
                      py: 1.5,
                      fontFamily: "'Poppins', sans-serif",
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      borderRadius: '8px',
                      boxShadow: '0 4px 14px rgba(79, 209, 197, 0.3)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Chat with TripBot
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Right side - Animated TripBot visual */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                position: 'relative',
                height: 450,
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
                    width: '90%',
                    height: '85%',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(79, 209, 197, 0.2)',
                    background: 'rgba(17, 25, 40, 0.8)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(79, 209, 197, 0.2)',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.02)' },
                      '100%': { transform: 'scale(1)' }
                    },
                    animation: isTripBotVisible ? 'pulse 4s infinite ease-in-out' : 'none'
                  }}
                >
                  {/* ChatBot UI Window */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '40px',
                    background: 'rgba(17, 25, 40, 0.9)',
                    borderBottom: '1px solid rgba(79, 209, 197, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    px: 2
                  }}>
                    <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                      {[
                        { color: '#FF5F57' },
                        { color: '#FFBD2E' },
                        { color: '#28CA41' }
                      ].map((dot, i) => (
                        <Box 
                          key={i}
                          sx={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: dot.color
                          }}
                        />
                      ))}
                    </Box>
                    <Typography
                      sx={{
                        color: '#fff',
                        fontSize: '0.8rem',
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 500,
                        opacity: 0.8
                      }}
                    >
                      Ceylon TripBot — AI Travel Companion
                    </Typography>
                  </Box>
                  
                  {/* Bot messages area */}
                  <Box sx={{
                    position: 'absolute',
                    top: '40px',
                    left: 0,
                    right: 0,
                    bottom: '60px',
                    p: 2,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}>
                    {/* Bot intro message */}
                    <Box sx={{ display: 'flex', gap: 1.5, maxWidth: '80%' }}>
                      <Box sx={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4FD1C5, #63B3ED)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 8px rgba(79, 209, 197, 0.3)'
                      }}>
                        <SmartToyIcon sx={{ fontSize: 20, color: '#fff' }} />
                      </Box>
                      <Box sx={{
                        background: 'rgba(79, 209, 197, 0.1)',
                        p: 2,
                        borderRadius: '2px 16px 16px 16px',
                        border: '1px solid rgba(79, 209, 197, 0.2)'
                      }}>
                        <Typography
                          sx={{
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: 500,
                            mb: 1
                          }}
                        >
                          Ayubowan! I'm Ceylon TripBot 🇱🇰
                        </Typography>
                        <Typography
                          sx={{
                            color: '#E2E8F0',
                            fontSize: '0.85rem',
                            fontFamily: "'Poppins', sans-serif",
                            lineHeight: 1.5
                          }}
                        >
                          I can help you plan your perfect Sri Lanka trip. What places would you like to visit?
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Quick reply buttons */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 7 }}>
                      {[
                        "I need help planning my itinerary",
                        "Recommend best beaches",
                        "Cultural experiences",
                        "Best time to visit"
                      ].map((text, i) => (
                        <Box
                          key={i}
                          sx={{
                            background: 'rgba(255, 255, 255, 0.07)',
                            borderRadius: '16px',
                            px: 2,
                            py: 0.8,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            '&:hover': {
                              background: 'rgba(79, 209, 197, 0.15)',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          <Typography
                            sx={{
                              color: '#E2E8F0',
                              fontSize: '0.8rem',
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          >
                            {text}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    
                    {/* User message */}
                    <Box sx={{ display: 'flex', gap: 1.5, alignSelf: 'flex-end', maxWidth: '80%' }}>
                      <Box sx={{
                        background: 'rgba(99, 179, 237, 0.2)',
                        p: 2,
                        borderRadius: '16px 2px 16px 16px',
                        border: '1px solid rgba(99, 179, 237, 0.2)'
                      }}>
                        <Typography
                          sx={{
                            color: '#E2E8F0',
                            fontSize: '0.85rem',
                            fontFamily: "'Poppins', sans-serif",
                            lineHeight: 1.5
                          }}
                        >
                          I'd like to visit the beaches and ancient temples in Sri Lanka.
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: '#63B3ED',
                          fontSize: '0.9rem',
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: 500,
                          flexShrink: 0
                        }}
                      >
                        U
                      </Avatar>
                    </Box>
                    
                    {/* Bot response with recommendation */}
                    <Box sx={{ display: 'flex', gap: 1.5, maxWidth: '80%' }}>
                      <Box sx={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4FD1C5, #63B3ED)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 8px rgba(79, 209, 197, 0.3)'
                      }}>
                        <SmartToyIcon sx={{ fontSize: 20, color: '#fff' }} />
                      </Box>
                      <Box sx={{
                        background: 'rgba(79, 209, 197, 0.1)',
                        p: 2,
                        borderRadius: '2px 16px 16px 16px',
                        border: '1px solid rgba(79, 209, 197, 0.2)'
                      }}>
                        <Typography
                          sx={{
                            color: '#E2E8F0',
                            fontSize: '0.85rem',
                            fontFamily: "'Poppins', sans-serif",
                            lineHeight: 1.5,
                            mb: 2
                          }}
                        >
                          Great choice! I recommend starting with Unawatuna Beach, then visiting the Galle Fort (UNESCO site), followed by the ancient city of Polonnaruwa and the Temple of the Sacred Tooth Relic in Kandy.
                        </Typography>
                        <Box 
                          sx={{
                            background: 'rgba(17, 25, 40, 0.6)',
                            borderRadius: '8px',
                            p: 1.5,
                            border: '1px solid rgba(99, 179, 237, 0.2)',
                            mb: 1.5
                          }}
                        >
                          <Typography
                            sx={{
                              color: '#63B3ED',
                              fontSize: '0.8rem',
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: 600,
                              mb: 1
                            }}
                          >
                            ✨ Suggested 7-Day Itinerary
                          </Typography>
                          <Typography
                            sx={{
                              color: '#E2E8F0',
                              fontSize: '0.8rem',
                              fontFamily: "'Poppins', sans-serif",
                              lineHeight: 1.5
                            }}
                          >
                            Day 1-2: Colombo & Negombo Beach<br/>
                            Day 3-4: Galle Fort & Unawatuna Beach<br/>
                            Day 5-6: Kandy & Temple of the Tooth<br/>
                            Day 7: Polonnaruwa Ancient City
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            color: '#B2F5EA',
                            fontSize: '0.85rem',
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: 500
                          }}
                        >
                          Would you like to customize this itinerary?
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  {/* Input area */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '60px',
                    background: 'rgba(17, 25, 40, 0.9)',
                    borderTop: '1px solid rgba(79, 209, 197, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    gap: 1
                  }}>
                    <Box sx={{
                      flex: 1,
                      height: '36px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      borderRadius: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}>
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '0.85rem',
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      >
                        Type your message...
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4FD1C5, #63B3ED)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <ChatIcon sx={{ fontSize: 20, color: '#fff' }} />
                    </Box>
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