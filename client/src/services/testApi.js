import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const testConnection = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/test`);
    return response.data;
  } catch (error) {
    console.error('Error testing connection:', error);
    throw error;
  }
};

export const testAuth = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/api/test/auth`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error testing auth:', error);
    throw error;
  }
};

export const testUpload = async (file, token) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/api/test/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error testing upload:', error);
    throw error;
  }
}; 