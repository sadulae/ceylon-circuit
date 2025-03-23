import React, { useState, useEffect } from 'react';
import { AppBar, Box, Toolbar, Typography, Button, Container, useScrollTrigger, Avatar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLogoAnimated, setIsLogoAnimated] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Wait for page load
    window.addEventListener('load', () => {
      setIsPageLoaded(true);
    });

    // Fallback if page is already loaded
    if (document.readyState === 'complete') {
      setIsPageLoaded(true);
    }

    return () => {
      window.removeEventListener('load', () => setIsPageLoaded(true));
    };
  }, []);

  useEffect(() => {
    let startTimer;
    let endTimer;

    if (isPageLoaded) {
      // Start animation after 500ms of page load
      startTimer = setTimeout(() => {
        setIsLogoAnimated(true);
      }, 500);

      // End animation after 4 seconds
      endTimer = setTimeout(() => {
        setIsLogoAnimated(false);
      }, 4000);
    }

    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [isPageLoaded]);

  const handleLogin = () => {
    // Store the current path in localStorage before navigating to login
    const currentPath = location.pathname;
    if (currentPath !== '/login') {
      localStorage.setItem('redirectPath', currentPath);
    }
    navigate('/login');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <Box 
      sx={{ 
        position: 'fixed',
        width: '100%',
        top: isScrolled ? 16 : 24,
        left: 0,
        zIndex: 1100,
        transition: 'all 0.3s ease-in-out',
        px: { xs: 2, sm: 4, md: 6, lg: 8 }, // Responsive padding on sides
      }}
    >
      <AppBar 
        position="relative" 
        sx={{
          background: isScrolled 
            ? 'rgba(14, 55, 78, 0.95)'
            : 'rgba(14, 55, 78, 0.8)',
          boxShadow: isScrolled 
            ? '0 4px 20px rgba(14, 55, 78, 0.2)'
            : '0 2px 10px rgba(14, 55, 78, 0.1)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: '12px',
          transition: 'all 0.3s ease-in-out',
          maxWidth: '1400px',
          margin: '0 auto',
          '& .MuiToolbar-root': {
            py: isScrolled ? 1 : 1.5,
          },
          '@keyframes gradientText': {
            '0%': {
              backgroundPosition: '0% 50%',
              opacity: 0
            },
            '10%': {
              opacity: 1
            },
            '50%': {
              backgroundPosition: '100% 50%',
              opacity: 1
            },
            '90%': {
              opacity: 1
            },
            '100%': {
              backgroundPosition: '0% 50%',
              opacity: 0
            }
          },
          '@keyframes fadeInLogo': {
            '0%': {
              opacity: 0,
              transform: 'translateY(-20px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}
      >
        <Toolbar 
          sx={{ 
            justifyContent: 'space-between',
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <Typography 
            variant="h6" 
            component="div"
            onClick={() => navigate('/')}
            sx={{ 
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1.5rem',
              ml: 2,
              fontFamily: "'Poppins', sans-serif",
              opacity: isPageLoaded ? 1 : 0,
              transform: isPageLoaded ? 'translateY(0)' : 'translateY(-20px)',
              animation: isPageLoaded ? 'fadeInLogo 0.5s ease-out' : 'none',
              background: isLogoAnimated
                ? 'linear-gradient(45deg, #4FD1C5 30%, #0E374E 90%)'
                : '#fff',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: isLogoAnimated ? 'transparent' : '#fff',
              transition: 'all 0.6s ease-in-out',
              textShadow: isScrolled || isLogoAnimated ? 'none' : '2px 2px 4px rgba(0,0,0,0.3)',
              position: 'relative',
              '&::after': {
                content: '"Ceylon Circuit"',
                position: 'absolute',
                left: 0,
                top: 0,
                color: '#fff',
                opacity: isLogoAnimated ? 0 : 1,
                transition: 'opacity 0.6s ease-in-out',
                textShadow: isScrolled ? 'none' : '2px 2px 4px rgba(0,0,0,0.3)',
              },
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}
          >
            Ceylon Circuit
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
            <Button 
              color="inherit"
              onClick={() => navigate('/')}
              sx={{ 
                color: '#fff',
                textShadow: isScrolled ? 'none' : '1px 1px 2px rgba(0,0,0,0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(79, 209, 197, 0.2)',
                  color: '#4FD1C5'
                },
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              Home
            </Button>
            
            {isAuthenticated ? (
              <>
                <Button 
                  color="inherit"
                  onClick={() => navigate('/tripbot')}
                  sx={{ 
                    color: '#fff',
                    textShadow: isScrolled ? 'none' : '1px 1px 2px rgba(0,0,0,0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(79, 209, 197, 0.2)',
                      color: '#4FD1C5'
                    },
                    fontFamily: "'Poppins', sans-serif"
                  }}
                >
                  TripBot
                </Button>
                <Button 
                  color="inherit"
                  onClick={() => navigate('/profile')}
                  sx={{ 
                    color: '#fff',
                    textShadow: isScrolled ? 'none' : '1px 1px 2px rgba(0,0,0,0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(79, 209, 197, 0.2)',
                      color: '#4FD1C5'
                    },
                    fontFamily: "'Poppins', sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32,
                      bgcolor: '#4FD1C5',
                      fontSize: '1rem',
                      fontFamily: "'Poppins', sans-serif"
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  Profile
                </Button>
                <Button 
                  color="inherit"
                  onClick={handleLogout}
                  sx={{ 
                    color: '#fff',
                    textShadow: isScrolled ? 'none' : '1px 1px 2px rgba(0,0,0,0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(79, 209, 197, 0.2)',
                      color: '#4FD1C5'
                    },
                    fontFamily: "'Poppins', sans-serif"
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                variant={isScrolled ? "outlined" : "contained"}
                onClick={handleLogin}
                sx={{ 
                  color: '#fff',
                  borderColor: '#4FD1C5',
                  backgroundColor: isScrolled ? 'transparent' : 'rgba(79, 209, 197, 0.8)',
                  textShadow: isScrolled ? 'none' : '1px 1px 2px rgba(0,0,0,0.3)',
                  '&:hover': {
                    backgroundColor: '#4FD1C5',
                    borderColor: '#4FD1C5',
                  },
                  fontFamily: "'Poppins', sans-serif"
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar; 