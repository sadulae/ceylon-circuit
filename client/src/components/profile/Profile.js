import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  InputAdornment,
  Fade,
  Chip
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../../redux/slices/authSlice';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const Profile = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    interests: user?.interests || ['Travel', 'Adventure', 'Culture']
  });

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: 12,
        pb: 6,
        background: 'linear-gradient(135deg, #0E374E 0%, #4FD1C5 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite',
        '@keyframes gradient': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      }}
    >
      <Fade in={isPageLoaded} timeout={800}>
        <Container maxWidth="md">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4
              }}
            >
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: '#4FD1C5',
                  fontSize: '3rem',
                  mb: 2,
                  border: '4px solid #fff',
                  boxShadow: '0 4px 14px rgba(79, 209, 197, 0.2)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography
                variant="h4"
                sx={{
                  color: '#0E374E',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  mb: 1
                }}
              >
                {user?.username}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mb: 2 }}>
                {formData.interests.map((interest, index) => (
                  <Chip
                    key={index}
                    label={interest}
                    sx={{
                      bgcolor: 'rgba(79, 209, 197, 0.1)',
                      color: '#4FD1C5',
                      borderRadius: '16px',
                      '&:hover': {
                        bgcolor: 'rgba(79, 209, 197, 0.2)',
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>

            {error && (
              <Fade in={true}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              </Fade>
            )}

            {success && (
              <Fade in={true}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              </Fade>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: '#4FD1C5' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#4FD1C5',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4FD1C5',
                        },
                        '&.Mui-disabled': {
                          bgcolor: 'rgba(79, 209, 197, 0.05)',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#4FD1C5',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: '#4FD1C5' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#4FD1C5',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4FD1C5',
                        },
                        '&.Mui-disabled': {
                          bgcolor: 'rgba(79, 209, 197, 0.05)',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#4FD1C5',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: '#4FD1C5' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#4FD1C5',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4FD1C5',
                        },
                        '&.Mui-disabled': {
                          bgcolor: 'rgba(79, 209, 197, 0.05)',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#4FD1C5',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon sx={{ color: '#4FD1C5' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#4FD1C5',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4FD1C5',
                        },
                        '&.Mui-disabled': {
                          bgcolor: 'rgba(79, 209, 197, 0.05)',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#4FD1C5',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    multiline
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder={!isEditing ? "No bio added yet" : "Tell us about yourself..."}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#4FD1C5',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4FD1C5',
                        },
                        '&.Mui-disabled': {
                          bgcolor: 'rgba(79, 209, 197, 0.05)',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#4FD1C5',
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                {isEditing ? (
                  <>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      sx={{
                        bgcolor: '#4FD1C5',
                        color: 'white',
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '1rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          bgcolor: '#38A89D'
                        },
                        '&.Mui-disabled': {
                          bgcolor: '#4FD1C5',
                          opacity: 0.7,
                        }
                      }}
                    >
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          username: user?.username || '',
                          email: user?.email || '',
                          phone: user?.phone || '',
                          location: user?.location || '',
                          bio: user?.bio || '',
                          interests: user?.interests || ['Travel', 'Adventure', 'Culture']
                        });
                      }}
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      sx={{
                        color: '#4FD1C5',
                        borderColor: '#4FD1C5',
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '1rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          borderColor: '#38A89D',
                          color: '#38A89D',
                          bgcolor: 'rgba(79, 209, 197, 0.1)'
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="contained"
                    startIcon={<EditIcon />}
                    sx={{
                      bgcolor: '#4FD1C5',
                      color: 'white',
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '1rem',
                      fontWeight: 500,
                      textTransform: 'none',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        bgcolor: '#38A89D'
                      }
                    }}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Container>
      </Fade>
    </Box>
  );
};

export default Profile; 