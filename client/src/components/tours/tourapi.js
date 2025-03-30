import axios from 'axios';

const API_URL = 'http://localhost:5000/api/guides';

// Fetch all tour guides
export const fetchGuides = async () => {
    return await axios.get(API_URL);
};

// Add a new guide
export const createGuide = async (formData) => {
    return await axios.post(API_URL, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// Delete a guide
export const deleteGuide = async (id) => {
    return await axios.delete(`${API_URL}/${id}`);
};

// Update a guide
export const updateGuide = async (id, formData) => {
    return await axios.put(`${API_URL}/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};