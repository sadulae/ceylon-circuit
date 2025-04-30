import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: '#0E374E',
        color: 'white',
        py: 6,
        mt: 'auto',
        borderTop: '4px solid #4FD1C5'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                color: '#4FD1C5'
              }}
            >
              Ceylon Circuit
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 2,
                color: '#CBD5E0',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              Discover the beauty of Sri Lanka with our AI-powered travel planning assistant.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton 
                sx={{ 
                  color: '#4FD1C5',
                  '&:hover': {
                    color: '#38A89D',
                    backgroundColor: 'rgba(79, 209, 197, 0.1)'
                  }
                }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton 
                sx={{ 
                  color: '#4FD1C5',
                  '&:hover': {
                    color: '#38A89D',
                    backgroundColor: 'rgba(79, 209, 197, 0.1)'
                  }
                }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton 
                sx={{ 
                  color: '#4FD1C5',
                  '&:hover': {
                    color: '#38A89D',
                    backgroundColor: 'rgba(79, 209, 197, 0.1)'
                  }
                }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton 
                sx={{ 
                  color: '#4FD1C5',
                  '&:hover': {
                    color: '#38A89D',
                    backgroundColor: 'rgba(79, 209, 197, 0.1)'
                  }
                }}
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                color: '#4FD1C5'
              }}
            >
              Quick Links
            </Typography>
            <Link 
              href="/" 
              sx={{ 
                color: '#CBD5E0',
                display: 'block',
                mb: 1,
                fontFamily: "'Poppins', sans-serif",
                textDecoration: 'none',
                '&:hover': {
                  color: '#4FD1C5'
                }
              }}
            >
              Home
            </Link>
            <Link 
              href="/about" 
              sx={{ 
                color: '#CBD5E0',
                display: 'block',
                mb: 1,
                fontFamily: "'Poppins', sans-serif",
                textDecoration: 'none',
                '&:hover': {
                  color: '#4FD1C5'
                }
              }}
            >
              About Us
            </Link>
            <Link 
              href="/tripbot" 
              sx={{ 
                color: '#CBD5E0',
                display: 'block',
                mb: 1,
                fontFamily: "'Poppins', sans-serif",
                textDecoration: 'none',
                '&:hover': {
                  color: '#4FD1C5'
                }
              }}
            >
              TripBot
            </Link>
            <Link 
              href="/contact" 
              sx={{ 
                color: '#CBD5E0',
                display: 'block',
                fontFamily: "'Poppins', sans-serif",
                textDecoration: 'none',
                '&:hover': {
                  color: '#4FD1C5'
                }
              }}
            >
              Contact
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                color: '#4FD1C5'
              }}
            >
              Contact Info
            </Typography>
            <Typography 
              variant="body2" 
              paragraph
              sx={{
                color: '#CBD5E0',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              123 Temple Road
              Colombo, Sri Lanka
            </Typography>
            <Typography 
              variant="body2" 
              paragraph
              sx={{
                color: '#CBD5E0',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              Email: info@ceyloncircuit.com
            </Typography>
            <Typography 
              variant="body2"
              sx={{
                color: '#CBD5E0',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              Phone: +94 11 234 5678
            </Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 5, pt: 2, borderTop: '1px solid rgba(203, 213, 224, 0.1)' }}>
          <Typography 
            variant="body2" 
            align="center"
            sx={{
              color: '#CBD5E0',
              fontFamily: "'Poppins', sans-serif"
            }}
          >
            © {new Date().getFullYear()} Ceylon Circuit. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 