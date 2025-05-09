import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import './TripBotLoader.css';
import sriLankaImage from '../../assets/images/srilanka.png';

const TripBotLoader = ({ onLoadComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Simulate loading completion after a set time
    const loadingTimer = setTimeout(() => {
      setIsTransitioning(true);
      
      // Add a delay before calling the completion handler
      const transitionTimer = setTimeout(() => {
        setIsLoading(false);
        if (onLoadComplete) onLoadComplete();
      }, 1000); // 1 second fade out transition
      
      return () => clearTimeout(transitionTimer);
    }, 3000); // 3 seconds loading time
    
    // Cleanup function
    return () => {
      clearTimeout(loadingTimer);
      document.body.style.overflow = '';
    };
  }, [onLoadComplete]);

  if (!isLoading) return null;

  return (
    <Box 
      className="tripbot-loader-container" 
      sx={{ 
        opacity: isTransitioning ? 0 : 1,
        transition: 'opacity 1s ease-out',
      }}
    >
      <Box className="loader-content">
        <Box className="loader-elements">
          <Box className="lotus-container">
            <Box className="lotus">
              <Box className="petal petal-1"></Box>
              <Box className="petal petal-2"></Box>
              <Box className="petal petal-3"></Box>
              <Box className="petal petal-4"></Box>
              <Box className="petal petal-5"></Box>
              <Box className="petal petal-6"></Box>
            </Box>
          </Box>
          
          <Box className="loader-map">
            <Box className="sri-lanka-image-container">
              <Box 
                component="img" 
                src={sriLankaImage}
                alt="Sri Lanka Map"
                className="sri-lanka-image"
              />
              <Box 
                component="img" 
                src={sriLankaImage}
                alt="Sri Lanka Map Glow"
                className="sri-lanka-image-blue-glow"
              />
              <Box className="location-dot location-dot-1"></Box>
              <Box className="location-dot location-dot-2"></Box>
              <Box className="location-dot location-dot-3"></Box>
              <Box className="location-dot location-dot-4"></Box>
              <Box className="map-label">SRI LANKA</Box>
            </Box>
          </Box>
        </Box>

        <Box className="loading-text-container">
          <Typography variant="h4" className="loading-title">
            Ceylon Circuit TripBot
          </Typography>
          <Typography variant="body1" className="loading-subtitle">
            Preparing your Sri Lankan adventure...
          </Typography>
          <Box className="loading-bar-container">
            <Box className="loading-bar"></Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TripBotLoader; 